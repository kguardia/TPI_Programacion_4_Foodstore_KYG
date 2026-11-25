from datetime import datetime, timezone

from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

# Máquina de estados (RN-02): cada estado y los estados a los que puede pasar.
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),  # terminal
    "CANCELADO": set(),  # terminal
}


# --- Excepciones de dominio: el Router las traduce a códigos HTTP ---
class PedidoNoEncontrado(Exception):
    """404"""


class ProductoNoEncontrado(Exception):
    """404: el producto no existe o está dado de baja"""


class PedidoAjeno(Exception):
    """403"""


class StockInsuficiente(Exception):
    """400"""


class ProductoNoDisponible(Exception):
    """400"""


class ProductoRepetido(Exception):
    """400"""


class TransicionInvalida(Exception):
    """400"""


def _ahora() -> datetime:
    return datetime.now(timezone.utc)


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ---------- RN-01: crear pedido ----------
    def crear(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        """Todo ocurre en una sola transacción: si algo falla, no se persiste nada."""
        with self.uow as uow:
            ids = [item.producto_id for item in data.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Un producto no puede repetirse en el pedido")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario_id,
                    estado="PENDIENTE",
                    forma_pago=data.forma_pago,
                    direccion_entrega=data.direccion_entrega,
                    notas=data.notas,
                    total=0,
                )
            )
            assert pedido.id is not None

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_for_update(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"'{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente de '{producto.nombre}': "
                        f"hay {producto.stock} y se pidieron {item.cantidad}"
                    )

                producto.stock -= item.cantidad  # descuento de stock
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        # RN-05: se copian el nombre y el precio vigentes hoy
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)
            uow.session.refresh(pedido)  # carga las líneas recién creadas
            return PedidoRead.model_validate(pedido)

    # ---------- consultas ----------
    def listar(
        self, usuario_id: int, es_admin: bool, skip: int, limit: int, estado: str | None
    ) -> PedidosPaginados:
        """RN-04: el cliente ve solo los suyos; el admin ve todos."""
        with self.uow as uow:
            if es_admin:
                total, pedidos = uow.pedidos.list_todos(skip, limit, estado)
            else:
                total, pedidos = uow.pedidos.list_by_usuario(usuario_id, skip, limit, estado)
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(p) for p in pedidos]
            )

    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener_o_404(uow, pedido_id)
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            # Inicio del día en hora local del servidor, expresado en UTC
            inicio = datetime.now().astimezone().replace(
                hour=0, minute=0, second=0, microsecond=0
            )
            return ResumenPedidos(
                pendientes=por_estado.get("PENDIENTE", 0),
                en_preparacion=por_estado.get("EN_PREPARACION", 0),
                entregados=por_estado.get("ENTREGADO", 0),
                cancelados=por_estado.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio.astimezone(timezone.utc)),
                ingresos_entregados=uow.pedidos.ingresos_entregados(),
            )

    # ---------- RN-02 / RN-03: cambios de estado ----------
    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """Uso del admin. Valida la transición antes de modificar el pedido."""
        with self.uow as uow:
            pedido = self._obtener_o_404(uow, pedido_id)
            self._aplicar_transicion(uow, pedido, nuevo_estado)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        """Uso del cliente (RN-04): solo sus pedidos y solo desde PENDIENTE."""
        with self.uow as uow:
            pedido = self._obtener_o_404(uow, pedido_id)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se puede cancelar un pedido en PENDIENTE")
            self._aplicar_transicion(uow, pedido, "CANCELADO")
            return PedidoRead.model_validate(pedido)

    # ---------- internos ----------
    @staticmethod
    def _obtener_o_404(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(f"Pedido {pedido_id} no encontrado")
        return pedido

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: str) -> None:
        if nuevo not in TRANSICIONES.get(pedido.estado, set()):
            raise TransicionInvalida(
                f"No se puede pasar de {pedido.estado} a {nuevo}"
            )
        if nuevo == "CANCELADO":
            # RN-03: el stock se restituye en la misma transacción que el cambio de estado
            for linea in pedido.items:
                producto = uow.productos.get_for_update(linea.producto_id)
                if producto is not None:
                    producto.stock += linea.cantidad
                    uow.productos.add(producto)
        pedido.estado = nuevo
        pedido.updated_at = _ahora()
        uow.pedidos.add(pedido)
