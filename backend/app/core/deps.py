from fastapi import Depends, HTTPException, Request, status
from sqlmodel import Session

from app.core.config import COOKIE_NAME
from app.core.database import get_session
from app.core.security import JWTError, decode_access_token
from app.modules.usuarios.models import Usuario


def get_current_user(
    request: Request, session: Session = Depends(get_session)
) -> Usuario:
    """Lee el JWT de la cookie HttpOnly. 401 si falta o no es válido."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "No autenticado")
    try:
        usuario_id = int(decode_access_token(token)["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido o vencido")
    usuario = session.get(Usuario, usuario_id)
    if usuario is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido o vencido")
    return usuario


def get_current_active_user(
    usuario: Usuario = Depends(get_current_user),
) -> Usuario:
    """400 si la cuenta está desactivada."""
    if usuario.disabled:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Cuenta de usuario desactivada")
    return usuario


def require_role(roles: list[str]):
    """Dependencia que exige que el usuario tenga uno de los roles. 403 si no."""

    def checker(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN, "No tenés permisos para esta acción"
            )
        return usuario

    return checker
