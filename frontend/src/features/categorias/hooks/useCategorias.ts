import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
} from "../api/categorias";
import type { CategoriaPayload } from "../types/categoria.types";

const KEY = ["categorias"] as const;

export function useCategorias() {
  return useQuery({ queryKey: KEY, queryFn: listarCategorias });
}

// Cada mutación invalida la query de categorías y avisa el resultado
function useMutacion<TVars>(
  fn: (vars: TVars) => Promise<unknown>,
  mensajeExito: string
) {
  const queryClient = useQueryClient();
  const notificar = useNotificationStore((s) => s.showNotification);
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      // los productos muestran el nombre de su categoría: también se refrescan
      await queryClient.invalidateQueries({ queryKey: KEY });
      await queryClient.invalidateQueries({ queryKey: ["productos"] });
      notificar(mensajeExito, "success");
    },
    onError: (error) => notificar(getApiErrorMessage(error), "error"),
  });
}

export function useCrearCategoria() {
  return useMutacion((payload: CategoriaPayload) => crearCategoria(payload), "Categoría creada");
}

export function useActualizarCategoria() {
  return useMutacion(
    ({ id, payload }: { id: number; payload: CategoriaPayload }) => actualizarCategoria(id, payload),
    "Categoría actualizada"
  );
}

export function useEliminarCategoria() {
  return useMutacion((id: number) => eliminarCategoria(id), "Categoría eliminada");
}
