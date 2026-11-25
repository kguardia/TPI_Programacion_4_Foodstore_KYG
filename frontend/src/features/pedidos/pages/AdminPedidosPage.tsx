import { useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getApiErrorMessage } from "@/shared/api/handleApiError";
import EstadoCarga from "@/shared/components/EstadoCarga";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import TablaDatos from "@/shared/components/TablaDatos";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Modal from "@/shared/ui/Modal";
import { formatearFecha, formatearPrecio } from "@/shared/utils/format";
import PedidoDetalle from "../components/PedidoDetalle";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import { TRANSICIONES, type EstadoPedido, type Pedido } from "../types/pedido.types";

const columnHelper = createColumnHelper<Pedido>();

const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "Preparar",
  ENTREGADO: "Entregar",
  CANCELADO: "Cancelar",
};

function AdminPedidosPage() {
  const [filtro, setFiltro] = useState<EstadoPedido | "">("");
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  // El filtro por estado lo resuelve el servidor; la paginación, la tabla
  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: 0,
    limit: 100,
    estado: filtro === "" ? undefined : filtro,
  });
  const cambiarEstado = useCambiarEstadoPedido();

  const pedidos = data?.items ?? [];

  const handleCambiar = (pedido: Pedido, estado: EstadoPedido) => {
    if (estado === "CANCELADO" && !window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) return;
    cambiarEstado.mutate({ id: pedido.id, estado });
  };

  const columns = [
    columnHelper.accessor("id", { header: "Número" }),
    columnHelper.accessor("usuario_id", { header: "Cliente (id)" }),
    columnHelper.accessor("created_at", {
      header: "Fecha",
      cell: (info) => formatearFecha(info.getValue()),
    }),
    columnHelper.accessor("forma_pago", { header: "Pago" }),
    columnHelper.accessor("total", {
      header: "Total",
      cell: (info) => formatearPrecio(info.getValue()),
    }),
    columnHelper.accessor("estado", {
      header: "Estado",
      cell: (info) => <BadgeEstado estado={info.getValue()} />,
    }),
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex flex-wrap justify-end gap-3 whitespace-nowrap">
          <button
            onClick={() => setDetalle(row.original)}
            className="font-medium text-slate-700 hover:underline"
          >
            Ver
          </button>
          {TRANSICIONES[row.original.estado].map((siguiente) => (
            <button
              key={siguiente}
              disabled={cambiarEstado.isPending}
              onClick={() => handleCambiar(row.original, siguiente)}
              className={`font-medium hover:underline disabled:opacity-50 ${
                siguiente === "CANCELADO" ? "text-red-600" : "text-blue-600"
              }`}
            >
              {ETIQUETA_ACCION[siguiente]}
            </button>
          ))}
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: pedidos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <select
          aria-label="Filtrar por estado"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as EstadoPedido | "")}
          className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_PREPARACION">En preparación</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {isLoading && <EstadoCarga mensaje="Cargando pedidos..." />}
      {isError && (
        <EstadoError
          mensaje={getApiErrorMessage(error, "No se pudieron cargar los pedidos")}
          onReintentar={() => void refetch()}
        />
      )}
      {!isLoading && !isError && pedidos.length === 0 && (
        <EstadoVacio mensaje="No hay pedidos para mostrar." />
      )}
      {!isLoading && !isError && pedidos.length > 0 && <TablaDatos table={table} />}

      <Modal isOpen={detalle !== null} title={`Pedido #${detalle?.id ?? ""}`} onClose={() => setDetalle(null)}>
        {detalle && <PedidoDetalle pedido={detalle} />}
      </Modal>
    </>
  );
}

export default AdminPedidosPage;
