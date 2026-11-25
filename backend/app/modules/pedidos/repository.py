from datetime import datetime

from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def _listar(
        self, skip: int, limit: int, estado: str | None, usuario_id: int | None
    ) -> tuple[int, list[Pedido]]:
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)
        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*filtros)
        ).one()
        items = self.session.exec(
            select(Pedido).where(*filtros).order_by(Pedido.id.desc()).offset(skip).limit(limit)  # type: ignore[union-attr]
        ).all()
        return total, list(items)

    def list_by_usuario(
        self, usuario_id: int, skip: int, limit: int, estado: str | None
    ) -> tuple[int, list[Pedido]]:
        return self._listar(skip, limit, estado, usuario_id)

    def list_todos(
        self, skip: int, limit: int, estado: str | None
    ) -> tuple[int, list[Pedido]]:
        return self._listar(skip, limit, estado, None)

    def count_by_estado(self) -> dict[str, int]:
        filas = self.session.exec(
            select(Pedido.estado, func.count()).group_by(Pedido.estado)
        ).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count()).select_from(Pedido).where(Pedido.created_at >= desde)
        ).one()

    def ingresos_entregados(self) -> float:
        return float(
            self.session.exec(
                select(func.coalesce(func.sum(Pedido.total), 0)).where(
                    Pedido.estado == "ENTREGADO"
                )
            ).one()
        )
