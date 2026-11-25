from typing import Generic, TypeVar

from sqlmodel import Session, SQLModel, select

ModelT = TypeVar("ModelT", bound=SQLModel)


class BaseRepository(Generic[ModelT]):
    """CRUD genérico. Nunca llama a commit(): eso lo hace el Unit of Work."""

    def __init__(self, session: Session, model: type[ModelT]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id_: int) -> ModelT | None:
        return self.session.get(self.model, id_)

    def get_all(self) -> list[ModelT]:
        return list(self.session.exec(select(self.model)).all())

    def add(self, obj: ModelT) -> ModelT:
        self.session.add(obj)
        self.session.flush()  # asigna el id sin confirmar la transacción
        return obj

    def delete(self, obj: ModelT) -> None:
        self.session.delete(obj)
        self.session.flush()
