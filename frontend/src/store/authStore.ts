import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setUnauthorizedHandler } from "@/shared/api/axiosInstance";
import type { Usuario } from "@/features/auth";

interface AuthState {
  usuario: Usuario | null;
  cargando: boolean; // true mientras checkSession confirma la sesión con /auth/me
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        // OAuth2 usa un formulario (no JSON). El servidor responde con la cookie HttpOnly.
        await api.post("/auth/token", new URLSearchParams({ username, password }));
        const { data } = await api.get<Usuario>("/auth/me");
        set({ usuario: data });
      },

      logout: async () => {
        try {
          await api.post("/auth/logout"); // el servidor borra la cookie
        } finally {
          set({ usuario: null });
        }
      },

      // Se llama una sola vez al montar la aplicación (App.tsx)
      checkSession: async () => {
        set({ cargando: true });
        try {
          const { data } = await api.get<Usuario>("/auth/me");
          set({ usuario: data });
        } catch {
          set({ usuario: null });
        } finally {
          set({ cargando: false });
        }
      },

      clearSession: () => set({ usuario: null }),
    }),
    {
      name: "auth-storage",
      // Solo se guarda el usuario (para evitar el parpadeo al recargar).
      // El token NUNCA se guarda: vive en la cookie HttpOnly.
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);

// Ante un 401 (o cuenta desactivada) el interceptor limpia la sesión
setUnauthorizedHandler(() => useAuthStore.getState().clearSession());
