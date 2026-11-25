from fastapi import APIRouter, Depends

from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(
    prefix="/admin/usuarios",
    tags=["Usuarios (admin)"],
)


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    _: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    _: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.activar(usuario_id)


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    actual: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
):
    assert actual.id is not None
    return service.desactivar(usuario_id, actual.id)
