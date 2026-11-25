import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from "../api/productos";
import type { FiltrosProductos, ProductoPayload, StockPayload } from "../types/producto.types";

// El queryKey incluye los filtros: cada combinación tiene su propia caché
export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => listarProductos(filtros),
    placeholderData: keepPreviousData, // la lista anterior queda visible mientras carga la nueva
  });
}

function useMutacion<TVars>(fn: (vars: TVars) => Promise<unknown>, mensajeExito: string) {
  const queryClient = useQueryClient();
  const notificar = useNotificationStore((s) => s.showNotification);
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["productos"] });
      notificar(mensajeExito, "success");
    },
    onError: (error) => notificar(getApiErrorMessage(error), "error"),
  });
}

export function useCrearProducto() {
  return useMutacion((payload: ProductoPayload) => crearProducto(payload), "Producto creado");
}

export function useActualizarProducto() {
  return useMutacion(
    ({ id, payload }: { id: number; payload: ProductoPayload }) => actualizarProducto(id, payload),
    "Producto actualizado"
  );
}

export function useActualizarStock() {
  return useMutacion(
    ({ id, payload }: { id: number; payload: StockPayload }) => actualizarStock(id, payload),
    "Stock actualizado"
  );
}

export function useEliminarProducto() {
  return useMutacion((id: number) => eliminarProducto(id), "Producto eliminado");
}
