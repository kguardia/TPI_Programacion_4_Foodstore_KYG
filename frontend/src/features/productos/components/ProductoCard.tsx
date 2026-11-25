import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { formatearPrecio } from "@/shared/utils/format";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import type { Producto } from "../types/producto.types";

function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  const notificar = useNotificationStore((s) => s.showNotification);

  const sinStock = producto.stock <= 0;
  const noDisponible = !producto.disponible || sinStock;

  const handleAgregar = () => {
    const agregado = agregar({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_unitario: producto.precio_base,
      imagen_url: producto.imagen_url,
      stock: producto.stock,
    });
    if (agregado) notificar(`"${producto.nombre}" agregado al carrito`, "success");
    else notificar("Ya tenés en el carrito todo el stock disponible", "info");
  };

  return (
    <Card className="flex flex-col">
      {producto.imagen_url ? (
        <img
          src={producto.imagen_url}
          alt={producto.nombre}
          className="mb-3 h-36 w-full rounded object-cover"
        />
      ) : (
        <div className="mb-3 flex h-36 w-full items-center justify-center rounded bg-slate-100 text-sm text-slate-400">
          Sin imagen
        </div>
      )}
      <span className="mb-1 text-xs uppercase tracking-wide text-slate-500">
        {producto.categoria.nombre}
      </span>
      <h3 className="font-semibold">{producto.nombre}</h3>
      <p className="mb-3 flex-1 text-sm text-slate-600">{producto.descripcion}</p>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-lg font-bold">{formatearPrecio(producto.precio_base)}</span>
        <span className={`text-xs ${noDisponible ? "text-red-600" : "text-slate-500"}`}>
          {noDisponible ? (sinStock ? "Sin stock" : "No disponible") : `Stock: ${producto.stock}`}
        </span>
      </div>
      <Button onClick={handleAgregar} disabled={noDisponible}>
        Agregar al carrito
      </Button>
    </Card>
  );
}

export default ProductoCard;
