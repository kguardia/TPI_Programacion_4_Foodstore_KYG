from typing import Annotated

from pydantic import EmailStr, StringConstraints, field_validator
from sqlmodel import Field, SQLModel

Texto = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class UserCreate(SQLModel):
    username: Annotated[str, StringConstraints(strip_whitespace=True, min_length=3, max_length=50)]
    full_name: Texto
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("password")
    @classmethod
    def _max_72_bytes(cls, v: str) -> str:
        # bcrypt solo admite hasta 72 bytes
        if len(v.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar los 72 bytes")
        return v
