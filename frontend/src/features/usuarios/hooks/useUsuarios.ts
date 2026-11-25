import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import { activarUsuario, desactivarUsuario, listarUsuarios } from "../api/usuarios";

const KEY = ["usuarios"] as const;

export function useUsuarios() {
  return useQuery({ queryKey: KEY, queryFn: listarUsuarios });
}

function useMutacion(fn: (id: number) => Promise<unknown>, mensajeExito: string) {
  const queryClient = useQueryClient();
  const notificar = useNotificationStore((s) => s.showNotification);
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: KEY });
      notificar(mensajeExito, "success");
    },
    onError: (error) => notificar(getApiErrorMessage(error), "error"),
  });
}

export function useActivarUsuario() {
  return useMutacion(activarUsuario, "Usuario activado");
}

export function useDesactivarUsuario() {
  return useMutacion(desactivarUsuario, "Usuario desactivado");
}
