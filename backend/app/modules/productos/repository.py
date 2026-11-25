from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def get_for_update(self, producto_id: int) -> Producto | None:
        """Lee el producto bloqueando la fila (evita vender el mismo stock dos veces)."""
        return self.session.exec(
            select(Producto).where(Producto.id == producto_id).with_for_update()
        ).first()

    def search(
        self,
        skip: int,
        limit: int,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:
        """Productos activos; search busca en el nombre sin distinguir mayúsculas."""
        filtros = [Producto.activo == True]  # noqa: E712
        if search:
            filtros.append(Producto.nombre.icontains(search, autoescape=True))  # type: ignore[attr-defined]
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*filtros)
        ).one()
        items = self.session.exec(
            select(Producto).where(*filtros).order_by(Producto.id).offset(skip).limit(limit)
        ).all()
        return total, list(items)
