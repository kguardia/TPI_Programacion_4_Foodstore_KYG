import { Navigate, Outlet, useLocation } from "react-router-dom";
import EstadoCarga from "@/shared/components/EstadoCarga";
import { useAuthStore } from "@/store/authStore";
import type { Rol } from "@/features/auth";

interface ProtectedRouteProps {
  allowedRoles?: Rol[];
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  // Mientras checkSession confirma la sesión con /auth/me: indicador, sin redirigir
  if (cargando) return <EstadoCarga mensaje="Verificando sesión..." />;

  // Sin sesión: al login (guardando a dónde quería ir)
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;

  // Con sesión pero sin el rol necesario
  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
