import axios from "axios";

// baseURL sale de VITE_API_URL (frontend/.env). withCredentials: true hace que el
// navegador adjunte la cookie HttpOnly con el JWT: el frontend nunca lee el token.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
  withCredentials: true,
});

// El authStore registra acá qué hacer cuando la sesión deja de ser válida.
// Así axiosInstance no importa el store (evita una dependencia circular).
let alSesionInvalida: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  alSesionInvalida = handler;
}

// En estas rutas un 401 es un resultado esperado (credenciales incorrectas o
// "todavía no hay sesión"), así que no se trata como sesión vencida.
const RUTAS_EXENTAS = ["/auth/token", "/auth/me"];

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError<{ detail?: unknown }>(error)) {
      const url = error.config?.url ?? "";
      const status = error.response?.status;
      const detail = error.response?.data?.detail;
      const exenta = RUTAS_EXENTAS.some((ruta) => url.includes(ruta));
      const sesionInvalida =
        status === 401 ||
        (status === 400 && detail === "Cuenta de usuario desactivada");
      // Se limpia el authStore; ProtectedRoute redirige a /login al quedar sin usuario
      if (sesionInvalida && !exenta) alSesionInvalida?.();
    }
    return Promise.reject(error);
  }
);
