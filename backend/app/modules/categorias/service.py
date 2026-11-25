from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """404"""


class NombreDuplicado(Exception):
    """409"""


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    @staticmethod
    def _activa_o_404(uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        # Una categoría dada de baja se trata como inexistente
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada(f"Categoría {categoria_id} no encontrada")
        return categoria

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.list_activas()]

    def obtener(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._activa_o_404(uow, categoria_id))

    def crear(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre):
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            categoria = uow.categorias.add(Categoria(**data.model_dump()))
            return CategoriaRead.model_validate(categoria)

    def actualizar(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        """Actualización parcial: solo cambia los campos enviados."""
        with self.uow as uow:
            categoria = self._activa_o_404(uow, categoria_id)
            cambios = data.model_dump(exclude_unset=True)
            if cambios.get("nombre") is None:
                cambios.pop("nombre", None)
            nuevo = cambios.get("nombre")
            if nuevo is not None and nuevo != categoria.nombre:
                if uow.categorias.get_by_nombre(nuevo):
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")
            for campo, valor in cambios.items():
                setattr(categoria, campo, valor)
            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def eliminar(self, categoria_id: int) -> None:
        """Baja lógica: activo = False. No toca sus productos."""
        with self.uow as uow:
            categoria = self._activa_o_404(uow, categoria_id)
            categoria.activo = False
            uow.categorias.add(categoria)
