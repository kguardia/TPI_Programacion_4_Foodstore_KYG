from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables

# Importar los modelos asegura que SQLModel conozca TODAS las tablas al crearlas
from app.modules.categorias import models as _categorias_models  # noqa: F401
from app.modules.pedidos import models as _pedidos_models  # noqa: F401
from app.modules.productos import models as _productos_models  # noqa: F401
from app.modules.usuarios import models as _usuarios_models  # noqa: F401

from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description="API REST del Trabajo Práctico Integrador de Programación 4",
    lifespan=lifespan,
)

# CORS con credenciales: necesario para que el navegador envíe la cookie HttpOnly
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
app.include_router(auth_router, prefix=API_PREFIX)
app.include_router(usuarios_router, prefix=API_PREFIX)
app.include_router(categorias_router, prefix=API_PREFIX)
app.include_router(productos_router, prefix=API_PREFIX)
app.include_router(pedidos_router, prefix=API_PREFIX)
