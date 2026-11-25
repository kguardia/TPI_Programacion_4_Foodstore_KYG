from collections.abc import Iterator

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

_connect_args = (
    {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}
)
engine = create_engine(settings.DATABASE_URL, connect_args=_connect_args)


def create_all_tables() -> None:
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    return Session(engine)


def get_session() -> Iterator[Session]:
    """Sesión de solo lectura para las dependencias de seguridad (deps.py)."""
    with Session(engine) as session:
        yield session
