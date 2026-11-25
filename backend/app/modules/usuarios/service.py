from fastapi import HTTPException, status

from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """Listado, activación y desactivación de usuarios (solo admin).

    En este módulo se admite lanzar HTTPException desde el Service.
    """

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.list_all()]

    def _obtener_o_404(self, uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado")
        return usuario

    def activar(self, usuario_id: int) -> UserPublic:
        """Idempotente: responde 200 aunque ya estuviera activo."""
        with self.uow as uow:
            usuario = self._obtener_o_404(uow, usuario_id)
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, actual_id: int) -> UserPublic:
        """Idempotente. Un admin no puede desactivarse a sí mismo (400)."""
        with self.uow as uow:
            usuario = self._obtener_o_404(uow, usuario_id)
            if usuario.id == actual_id:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, "No podés desactivar tu propia cuenta"
                )
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)
