// Mismos nombres de campo que los schemas del backend
export type EstadoPedido = "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO";
export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

export interface DetallePedido {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
}

export interface PedidosPaginados {
  total: number;
  items: Pedido[];
}

export interface ResumenPedidos {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: number;
}

export interface FiltrosPedidos {
  skip: number;
  limit: number;
  estado?: EstadoPedido;
}

export interface PedidoCreatePayload {
  items: { producto_id: number; cantidad: number }[];
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
}

export interface CheckoutFormValues {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

// Estados a los que el admin puede pasar un pedido (espeja la máquina de estados del backend).
// El backend es quien valida: acá solo se decide qué botones mostrar.
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};
