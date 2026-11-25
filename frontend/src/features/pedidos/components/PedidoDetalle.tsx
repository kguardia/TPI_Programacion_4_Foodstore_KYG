import { formatearFecha, formatearPrecio } from "@/shared/utils/format";
import type { Pedido } from "../types/pedido.types";

// Líneas del pedido y datos de entrega
function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="text-sm">
      <table className="mb-3 w-full text-left">
        <thead className="text-xs uppercase text-slate-500">
          <tr>
            <th className="py-1">Producto</th>
            <th className="py-1 text-right">Precio</th>
            <th className="py-1 text-right">Cant.</th>
            <th className="py-1 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((item) => (
            <tr key={item.producto_id} className="border-t border-slate-200">
              <td className="py-1">{item.nombre_producto}</td>
              <td className="py-1 text-right">{formatearPrecio(item.precio_unitario)}</td>
              <td className="py-1 text-right">{item.cantidad}</td>
              <td className="py-1 text-right">{formatearPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-slate-300 font-semibold">
            <td className="py-1" colSpan={3}>
              Total
            </td>
            <td className="py-1 text-right">{formatearPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
      <p>
        <span className="text-slate-500">Dirección:</span> {pedido.direccion_entrega}
      </p>
      <p>
        <span className="text-slate-500">Forma de pago:</span>{" "}
        {pedido.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"}
      </p>
      {pedido.notas && (
        <p>
          <span className="text-slate-500">Notas:</span> {pedido.notas}
        </p>
      )}
      <p className="text-slate-500">Creado: {formatearFecha(pedido.created_at)}</p>
    </div>
  );
}

export default PedidoDetalle;
