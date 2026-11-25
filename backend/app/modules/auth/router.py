from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import COOKIE_NAME, settings
from app.core.deps import get_current_active_user
from app.core.security import create_access_token
from app.modules.auth.schemas import UserCreate
from app.modules.auth.service import AuthService
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: AuthService = Depends(get_auth_service)):
    return service.registrar(data)


@router.post("/token")
def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
):
    usuario_id = service.autenticar(form.username, form.password)
    # El JWT viaja solo en la cookie HttpOnly: nunca en el cuerpo de la respuesta
    response.set_cookie(
        key=COOKIE_NAME,
        value=create_access_token(str(usuario_id)),
        httponly=True,
        samesite="lax",
        secure=False,  # en producción (HTTPS) debería ser True
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return {"message": "Login exitoso"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/", httponly=True, samesite="lax")
    return {"message": "Sesión cerrada"}


@router.get("/me", response_model=UserPublic)
def me(usuario: Usuario = Depends(get_current_active_user)):
    return usuario
