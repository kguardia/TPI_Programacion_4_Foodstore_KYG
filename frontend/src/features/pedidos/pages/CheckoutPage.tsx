import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "@/shared/api/handleApiError";
import Card from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/format";
import { useCartStore } from "@/store/cartStore";
import CheckoutForm from "../components/CheckoutForm";
import { useCrearPedido } from "../hooks/usePedidos";
import type { CheckoutFormValues } from "../types/pedido.types";

function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Sin ítems no hay nada que confirmar
  if (items.length === 0 && !crearPedido.isSuccess) return <Navigate to="/carrito" replace />;

  const handleSubmit = async (values: CheckoutFormValues) => {
    setError(null);
    try {
      await crearPedido.mutateAsync({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: values.forma_pago,
        direccion_entrega: values.direccion_entrega.trim(),
        notas: values.notas.trim() === "" ? null : values.notas.trim(),
      });
      vaciar(); // el pedido se creó: se vacía el carrito
      navigate("/mis-pedidos");
    } catch (err) {
      // El detalle del error (por ejemplo, stock insuficiente) se muestra en el formulario
      setError(getApiErrorMessage(err, "No se pudo crear el pedido"));
    }
  };

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Confirmar pedido</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <CheckoutForm onSubmit={handleSubmit} error={error} />
        </Card>
        <Card className="h-fit p-6">
          <h2 className="mb-3 font-semibold">Resumen</h2>
          <ul className="mb-3 space-y-1 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <p className="border-t border-slate-200 pt-3 text-right text-lg font-bold">
            Total: {formatearPrecio(total)}
          </p>
        </Card>
      </div>
    </>
  );
}

export default CheckoutPage;
