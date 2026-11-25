"""Carga datos iniciales. Es idempotente: se puede ejecutar varias veces.

Uso (desde backend/):  python -m app.db.seed
"""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.pedidos import models as _pedidos_models  # noqa: F401
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin1234!"

CATEGORIAS = [
    ("Pizzas", "Pizzas artesanales al horno de piedra"),
    ("Hamburguesas", "Hamburguesas de carne con pan casero"),
    ("Bebidas", "Gaseosas, aguas y jugos"),
    ("Postres", "Dulces para cerrar la comida"),
]

# (nombre, descripcion, precio_base, stock, categoria)
PRODUCTOS = [
    ("Pizza Muzzarella", "Salsa de tomate y muzzarella", 9500, 20, "Pizzas"),
    ("Pizza Napolitana", "Muzzarella, tomate y ajo", 10800, 15, "Pizzas"),
    ("Pizza Fugazzeta", "Cebolla y muzzarella", 10200, 12, "Pizzas"),
    ("Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 8200, 25, "Hamburguesas"),
    ("Hamburguesa Doble", "Doble carne y cheddar", 10500, 18, "Hamburguesas"),
    ("Gaseosa Cola 500ml", "Botella individual", 1800, 50, "Bebidas"),
    ("Agua Mineral 500ml", "Sin gas", 1200, 60, "Bebidas"),
    ("Flan con Dulce de Leche", "Porción individual", 3200, 10, "Postres"),
    ("Brownie con Helado", "Brownie tibio y crema", 4500, 8, "Postres"),
]


def seed() -> None:
    create_all_tables()
    with Session(engine) as session:
        if not session.exec(select(Usuario).where(Usuario.username == ADMIN_USERNAME)).first():
            session.add(
                Usuario(
                    username=ADMIN_USERNAME,
                    full_name="Administrador Food Store",
                    email="admin@foodstore.com",
                    hashed_password=hash_password(ADMIN_PASSWORD),
                    role="admin",
                )
            )

        categorias: dict[str, Categoria] = {}
        for nombre, descripcion in CATEGORIAS:
            categoria = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=descripcion)
                session.add(categoria)
                session.flush()
            categorias[nombre] = categoria

        for nombre, descripcion, precio, stock, categoria in PRODUCTOS:
            if not session.exec(select(Producto).where(Producto.nombre == nombre)).first():
                session.add(
                    Producto(
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio,
                        stock=stock,
                        categoria_id=categorias[categoria].id,  # type: ignore[arg-type]
                    )
                )
        session.commit()
    print("Seed completado: admin / Admin1234!, categorías y productos cargados")


if __name__ == "__main__":
    seed()
