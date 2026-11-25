import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/format";

function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Carrito</h1>

      {items.length === 0 ? (
        <>
          <EstadoVacio mensaje="Tu carrito está vacío." />
          <p className="mt-4 text-center">
            <Link to="/" className="text-blue-600 hover:underline">
              Ver el catálogo
            </Link>
          </p>
        </>
      ) : (
        <>
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.producto_id} className="flex flex-wrap items-center gap-4">
                <div className="min-w-40 flex-1">
                  <p className="font-semibold">{item.nombre}</p>
                  <p className="text-sm text-slate-500">{formatearPrecio(item.precio_unitario)} c/u</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    aria-label={`Restar ${item.nombre}`}
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                  >
                    −
                  </Button>
                  <span className="w-8 text-center" data-testid={`cantidad-${item.producto_id}`}>
                    {item.cantidad}
                  </span>
                  <Button
                    variant="secondary"
                    aria-label={`Sumar ${item.nombre}`}
                    disabled={item.cantidad >= item.stock}
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                  >
                    +
                  </Button>
                </div>
                <p className="w-28 text-right font-semibold">
                  {formatearPrecio(item.precio_unitario * item.cantidad)}
                </p>
                <button
                  onClick={() => quitar(item.producto_id)}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Quitar
                </button>
              </Card>
            ))}
          </div>

          <Card className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-lg">
              Total: <span className="font-bold">{formatearPrecio(total)}</span>
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={vaciar}>
                Vaciar carrito
              </Button>
              <Link
                to="/checkout"
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Continuar con el pedido
              </Link>
            </div>
          </Card>
        </>
      )}
    </>
  );
}

export default CarritoPage;
