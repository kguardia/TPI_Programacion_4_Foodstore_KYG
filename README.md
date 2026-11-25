# Food Store — Trabajo Práctico Integrador (Programación 4)

Aplicación web para un negocio de comidas: los clientes se registran, recorren el
catálogo, arman un carrito y confirman pedidos; el administrador gestiona categorías,
productos, stock, pedidos y usuarios desde un panel.

- **Alumna:** Karen Yanet Guardia — UTN, Tecnicatura Universitaria en Programación
- **Repositorio:** https://github.com/kguardia/TPI_Programacion_4_Foodstore_KYG
- **Video de demostración:** https://youtu.be/fWkNnQb2r7g

## Estructura

    backend/    API REST (FastAPI + SQLModel + PostgreSQL)
    frontend/   Aplicación React (Vite + TypeScript + Tailwind CSS)

Son dos proyectos independientes que se comunican por HTTP. La sesión viaja en una
cookie **HttpOnly** (`access_token`): el frontend nunca lee ni guarda el token.

## Requisitos

| Herramienta | Versión |
|-------------|---------|
| Python      | 3.11 a 3.13 (SQLModel no funciona con 3.14 en las versiones fijadas de la especificación) |
| PostgreSQL  | 15 o superior |
| Node.js     | 20.19 o superior |
| pnpm        | 9 o superior |

## 1. Backend

Todos los comandos se ejecutan dentro de `backend/`.

**1. Crear la base de datos** (la contraseña es la de tu usuario `postgres`):

    psql -U postgres -c "CREATE DATABASE foodstore_db;"

**2. Entorno virtual e instalación de dependencias:**

    python -m venv .venv

    # Windows (PowerShell)
    .\.venv\Scripts\Activate.ps1
    # Windows (Git Bash)  source .venv/Scripts/activate
    # Linux / macOS       source .venv/bin/activate

    python -m pip install -r requirements.txt

**3. Variables de entorno:** copiar `.env.example` a `.env` y completar.

    # Windows (PowerShell): Copy-Item .env.example .env
    # Linux / macOS / Git Bash: cp .env.example .env

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión a la base | `postgresql://postgres:TU_CONTRASEÑA@localhost:5432/foodstore_db` (desarrollo: `sqlite:///./foodstore.db`) |
| `SECRET_KEY` | Firma del JWT, mínimo 32 caracteres | `python -c "import secrets; print(secrets.token_hex(32))"` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Vida de la cookie y del token | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

**4. Cargar los datos iniciales** (idempotente: se puede repetir sin duplicar nada):

    python -m app.db.seed

Crea el usuario administrador, 4 categorías y 9 productos con stock.

**5. Levantar la API:**

    python -m uvicorn app.main:app --reload

- API: http://localhost:8000/api/v1
- Documentación interactiva: http://localhost:8000/docs y http://localhost:8000/redoc

### Usuario administrador (seed)

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `admin` | `Admin1234!` | `admin` |

Los usuarios que se registran desde la aplicación tienen siempre el rol `user`.

## 2. Frontend

Todos los comandos se ejecutan dentro de `frontend/`.

**1. Variables de entorno:** copiar `.env.example` a `.env`.

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

**2. Instalar, verificar tipos y ejecutar:**

    pnpm install
    pnpm build      # verifica los tipos (tsc) y genera el build
    pnpm dev

Abrir http://localhost:5173/

> Usar `localhost` y no `127.0.0.1`: la cookie de sesión es `SameSite=Lax` y con otro
> host el navegador no la envía al backend.

## Qué se puede probar

**Como cliente** (registrarse en `/register` o crear la cuenta desde la app):
catálogo con búsqueda, filtro por categoría y paginación del lado del servidor;
carrito que persiste al recargar; checkout con formulario validado; «Mis pedidos» con
detalle y cancelación mientras el pedido está en `PENDIENTE` (el stock se restituye).

**Como administrador** (`admin` / `Admin1234!`): resumen con indicadores; ABM de
categorías y productos (incluido el cambio de stock y disponibilidad); gestión de
pedidos con cambio de estado y filtro; activación y desactivación de usuarios.

## Arquitectura del backend

Módulos por dominio dentro de `app/modules/` y una infraestructura compartida en `app/core/`.
Flujo de dependencias unidireccional: **Router → Service → Unit of Work → Repository → Model**.

    app/
    ├── main.py              Crea la app, CORS con credenciales y routers bajo /api/v1
    ├── core/
    │   ├── config.py        Settings (pydantic-settings, lee .env)
    │   ├── database.py      engine, create_all_tables y sesión
    │   ├── security.py      hash bcrypt y JWT
    │   ├── deps.py          get_current_user, get_current_active_user, require_role
    │   ├── unit_of_work.py  UnitOfWork base: abre la sesión; commit / rollback / close en __exit__
    │   └── base_repository.py  BaseRepository[T]: get_by_id, get_all, add, delete
    ├── modules/
    │   ├── auth/            router, service, schemas (registro, login, logout, /me)
    │   ├── usuarios/        listado, activación y desactivación (admin)
    │   ├── categorias/      CRUD con baja lógica
    │   ├── productos/       CRUD, stock, listado paginado con búsqueda y filtros
    │   └── pedidos/         creación transaccional, máquina de estados, cancelación, resumen
    └── db/seed.py           Datos iniciales (idempotente)

- **Unit of Work:** el `commit` ocurre solo en `UnitOfWork.__exit__`. Los Services abren
  `with self.uow as uow:` y devuelven el schema de salida dentro del bloque. Ningún Service ni
  Router llama a `session.commit()`; el Router obtiene el Service con `Depends`.
- **Pedidos:** `PedidoUnitOfWork` comparte la sesión entre los repositorios de pedidos y de
  productos, de modo que el pedido y el descuento de stock se confirman (o se revierten) juntos.
- **Reglas de negocio:** RN-01 a RN-06 en `pedidos/service.py`. Las líneas copian el nombre y el
  precio del producto (RN-05); la máquina de estados es un diccionario `TRANSICIONES`.
- **Errores:** los Services lanzan excepciones de dominio y los Routers las traducen a
  `HTTPException` (404, 409, 403, 400). `auth` y `usuarios` lanzan `HTTPException` directamente.

## Arquitectura del frontend (por features)

    src/
    ├── App.tsx, main.tsx    checkSession al montar y QueryClientProvider
    ├── features/            un dominio por carpeta: pages/ components/ hooks/ api/ types/ index.ts
    │   ├── auth/            Login, registro y acceso denegado
    │   ├── categorias/      ABM de categorías (admin)
    │   ├── productos/       Catálogo (cliente) y ABM de productos (admin)
    │   ├── pedidos/         Carrito, checkout, mis pedidos, pedidos y resumen (admin)
    │   └── usuarios/        Gestión de usuarios (admin)
    ├── shared/
    │   ├── api/             axiosInstance (withCredentials + interceptor de 401), handleApiError, queryClient
    │   ├── ui/              Button, Card, Input, Modal, BadgeEstado
    │   ├── components/      Paginacion, Skeleton, EstadoVacio, EstadoError, EstadoCarga, TablaDatos, Toast
    │   └── layout/          Navbar, MainLayout
    ├── store/               authStore, cartStore (Zustand con persist), notificationStore
    └── routes/              AppRouter y ProtectedRoute

- **Estado del servidor:** TanStack Query (`useQuery`, `useMutation`, invalidación en `onSuccess`).
  Ningún componente obtiene datos con `fetch` dentro de `useEffect`; la única llamada en
  `useEffect` es `checkSession` al montar la aplicación.
- **Estado del cliente:** Zustand. `authStore` usa `persist` con `partialize` (solo guarda el
  usuario, nunca el token); `cartStore` persiste los ítems del carrito.
- **Sesión:** `axiosInstance` usa `withCredentials: true`. Ante un 401 fuera de `/auth/token` y
  `/auth/me` (o ante «Cuenta de usuario desactivada») limpia el `authStore`, y `ProtectedRoute`
  redirige a `/login`. `ProtectedRoute` muestra un indicador mientras se confirma la sesión,
  redirige a `/login` sin sesión y a `/unauthorized` si falta el rol.
- **Formularios y tablas:** TanStack Form (login, registro, checkout, alta y edición) y
  TanStack Table (paneles de administración, con paginación del lado del cliente).
- **Seguridad:** ocultar un botón no reemplaza la protección real, que está en el backend
  (`require_role` responde 403).
