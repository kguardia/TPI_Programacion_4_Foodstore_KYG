import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage } from "@/shared/api/handleApiError";
import { useNotificationStore } from "@/store/notificationStore";
import {
  cambiarEstadoPedido,
  cancelarPedido,
  crearPedido,
  listarPedidos,
  obtenerResumen,
} from "../api/pedidos";
import type { EstadoPedido, FiltrosPedidos, PedidoCreatePayload } from "../types/pedido.types";

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ["pedidos", filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ["pedidos", "resumen"], queryFn: obtenerResumen });
}

// Crear o cancelar un pedido cambia el stock: se refrescan también los productos
function useMutacionPedido<TVars>(fn: (vars: TVars) => Promise<unknown>, mensajeExito: string) {
  const queryClient = useQueryClient();
  const notificar = useNotificationStore((s) => s.showNotification);
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      await queryClient.invalidateQueries({ queryKey: ["productos"] });
      notificar(mensajeExito, "success");
    },
    onError: (error) => notificar(getApiErrorMessage(error), "error"),
  });
}

export function useCrearPedido() {
  return useMutacionPedido((payload: PedidoCreatePayload) => crearPedido(payload), "Pedido confirmado");
}

export function useCambiarEstadoPedido() {
  return useMutacionPedido(
    ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    "Estado del pedido actualizado"
  );
}

export function useCancelarPedido() {
  return useMutacionPedido((id: number) => cancelarPedido(id), "Pedido cancelado");
}
