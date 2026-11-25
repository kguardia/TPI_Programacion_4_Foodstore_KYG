import { api } from "@/shared/api/axiosInstance";
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreatePayload,
  PedidosPaginados,
  ResumenPedidos,
} from "../types/pedido.types";

export async function crearPedido(payload: PedidoCreatePayload): Promise<Pedido> {
  const { data } = await api.post<Pedido>("/pedidos", payload);
  return data;
}

export async function listarPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const { data } = await api.get<PedidosPaginados>("/pedidos", { params: filtros });
  return data;
}

export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  return data;
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return data;
}

export async function obtenerResumen(): Promise<ResumenPedidos> {
  const { data } = await api.get<ResumenPedidos>("/pedidos/resumen");
  return data;
}
