import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const enlace = ({ isActive }: { isActive: boolean }) =>
  `hover:underline ${isActive ? "font-semibold underline" : ""}`;

function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidad = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0));
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const esAdmin = usuario?.role === "admin";

  return (
    <nav className="bg-slate-800 text-white shadow">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3">
        <Link to="/" className="text-xl font-bold">
          Food Store
        </Link>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
          <NavLink to="/" end className={enlace}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={enlace}>
            Carrito
            {cantidad > 0 && (
              <span className="ml-1 rounded-full bg-blue-600 px-2 py-0.5 text-xs">{cantidad}</span>
            )}
          </NavLink>

          {usuario && (
            <NavLink to="/mis-pedidos" className={enlace}>
              Mis pedidos
            </NavLink>
          )}

          {esAdmin && (
            <>
              <span className="text-slate-500">|</span>
              <NavLink to="/admin/resumen" className={enlace}>
                Resumen
              </NavLink>
              <NavLink to="/admin/categorias" className={enlace}>
                Categorías
              </NavLink>
              <NavLink to="/admin/productos" className={enlace}>
                Productos
              </NavLink>
              <NavLink to="/admin/pedidos" className={enlace}>
                Pedidos
              </NavLink>
              <NavLink to="/admin/usuarios" className={enlace}>
                Usuarios
              </NavLink>
            </>
          )}

          <span className="text-slate-500">|</span>
          {usuario ? (
            <>
              <span className="font-normal">
                {usuario.full_name}
                <span className="ml-2 rounded bg-slate-600 px-2 py-0.5 text-xs uppercase">
                  {usuario.role}
                </span>
              </span>
              <button
                onClick={() => void handleLogout()}
                className="rounded bg-slate-600 px-3 py-1 hover:bg-slate-500"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={enlace}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={enlace}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
