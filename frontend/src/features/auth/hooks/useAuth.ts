import { useAuthStore } from "@/store/authStore";

// Expone el estado de sesión del authStore a los componentes
export function useAuth() {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  return {
    usuario,
    cargando,
    login,
    logout,
    estaAutenticado: usuario !== null,
    esAdmin: usuario?.role === "admin",
  };
}
