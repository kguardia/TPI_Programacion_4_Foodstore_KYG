from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    """404"""


class CategoriaNoEncontrada(Exception):
    """404: la categoría no existe o está dada de baja"""


# Campos que no admiten null: si llegan en None se ignoran
_NO_NULOS = {"nombre", "precio_base", "stock", "disponible", "categoria_id"}


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    @staticmethod
    def _activo_o_404(uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        # Un producto dado de baja se trata como inexistente
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado(f"Producto {producto_id} no encontrado")
        return producto

    @staticmethod
    def _validar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"Categoría {categoria_id} no encontrada")

    def listar(
        self,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in items]
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._activo_o_404(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            producto = uow.productos.add(Producto(**data.model_dump()))
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        """Actualización parcial: solo cambia los campos enviados."""
        with self.uow as uow:
            producto = self._activo_o_404(uow, producto_id)
            cambios = {
                k: v
                for k, v in data.model_dump(exclude_unset=True).items()
                if not (v is None and k in _NO_NULOS)
            }
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])
            for campo, valor in cambios.items():
                setattr(producto, campo, valor)
            uow.productos.add(producto)
            uow.session.refresh(producto)  # recarga la relación categoria si cambió
            return ProductoRead.model_validate(producto)

    def actualizar_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._activo_o_404(uow, producto_id)
            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica: activo = False."""
        with self.uow as uow:
            producto = self._activo_o_404(uow, producto_id)
            producto.activo = False
            uow.productos.add(producto)
