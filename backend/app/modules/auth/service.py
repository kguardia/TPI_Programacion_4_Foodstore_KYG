from fastapi import HTTPException, status

from app.core.security import hash_password, verify_password
from app.modules.auth.schemas import UserCreate
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    """Registro y autenticación. Admite HTTPException desde el Service."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        """El registro público siempre crea un usuario con rol 'user'."""
        username = data.username.strip()
        email = data.email.lower()
        with self.uow as uow:
            if uow.usuarios.get_by_username(username) or uow.usuarios.get_by_email(email):
                raise HTTPException(
                    status.HTTP_409_CONFLICT, "El username o el email ya existen"
                )
            usuario = Usuario(
                username=username,
                full_name=data.full_name,
                email=email,
                hashed_password=hash_password(data.password),
                role="user",
            )
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def autenticar(self, username: str, password: str) -> int:
        """Devuelve el id del usuario. 401 credenciales incorrectas; 400 desactivada."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username.strip())
            if usuario is None or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status.HTTP_401_UNAUTHORIZED, "Credenciales incorrectas"
                )
            if usuario.disabled:
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada"
                )
            assert usuario.id is not None
            return usuario.id
