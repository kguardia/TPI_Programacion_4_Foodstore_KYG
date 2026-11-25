import { useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "@/shared/api/handleApiError";
import EstadoCarga from "@/shared/components/EstadoCarga";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { formatearFecha, formatearPrecio } from "@/shared/utils/format";
import PedidoDetalle from "../components/PedidoDetalle";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";

const POR_PAGINA = 10;

function MisPedidosPage() {
  const [page, setPage] = useState(1);
  const [abierto, setAbierto] = useState<number | null>(null); // pedido con el detalle desplegado
  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: (page - 1) * POR_PAGINA,
    limit: POR_PAGINA,
  });
  const cancelar = useCancelarPedido();

  const handleCancelar = (id: number) => {
    if (!window.confirm("¿Cancelar este pedido?")) return;
    cancelar.mutate(id);
  };

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Mis pedidos</h1>

      {isLoading && <EstadoCarga mensaje="Cargando tus pedidos..." />}
      {isError && (
        <EstadoError
          mensaje={getApiErrorMessage(error, "No se pudieron cargar tus pedidos")}
          onReintentar={() => void refetch()}
        />
      )}
      {data && data.items.length === 0 && (
        <>
          <EstadoVacio mensaje="Todavía no hiciste ningún pedido." />
          <p className="mt-4 text-center">
            <Link to="/" className="text-blue-600 hover:underline">
              Ir al catálogo
            </Link>
          </p>
        </>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="space-y-3">
            {data.items.map((pedido) => (
              <Card key={pedido.id}>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <p className="font-semibold">Pedido #{pedido.id}</p>
                  <p className="text-sm text-slate-500">{formatearFecha(pedido.created_at)}</p>
                  <BadgeEstado estado={pedido.estado} />
                  <p className="ml-auto font-semibold">{formatearPrecio(pedido.total)}</p>
                  <Button
                    variant="secondary"
                    onClick={() => setAbierto(abierto === pedido.id ? null : pedido.id)}
                  >
                    {abierto === pedido.id ? "Ocultar detalle" : "Ver detalle"}
                  </Button>
                  {pedido.estado === "PENDIENTE" && (
                    <Button
                      variant="danger"
                      disabled={cancelar.isPending}
                      onClick={() => handleCancelar(pedido.id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
                {abierto === pedido.id && (
                  <div className="mt-4 border-t border-slate-200 pt-4">
                    <PedidoDetalle pedido={pedido} />
                  </div>
                )}
              </Card>
            ))}
          </div>
          <Paginacion page={page} totalPages={Math.ceil(data.total / POR_PAGINA)} onChange={setPage} />
        </>
      )}
    </>
  );
}

export default MisPedidosPage;
