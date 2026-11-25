from collections.abc import Callable

from sqlmodel import Session

from app.core.database import session_factory as default_session_factory


class UnitOfWork:
    """Abre la sesión en __enter__; en __exit__ hace commit, rollback y close.

    Las subclases crean sus repositorios en _init_repositories().
    """

    def __init__(self, session_factory: Callable[[], Session] | None = None) -> None:
        self._session_factory = session_factory or default_session_factory
        self.session: Session | None = None

    def _init_repositories(self, session: Session) -> None:
        """Las subclases asignan acá sus repositorios."""

    def __enter__(self):
        self.session = self._session_factory()
        self._init_repositories(self.session)
        return self

    def __exit__(self, exc_type, exc, tb) -> bool:
        assert self.session is not None
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()
        return False  # no se traga la excepción
