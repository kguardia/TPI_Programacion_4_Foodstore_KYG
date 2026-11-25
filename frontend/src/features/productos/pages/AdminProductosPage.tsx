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
import Button from "@/shared/ui/Button";
import { formatearPrecio } from "@/shared/utils/format";
import ProductoFormModal from "../components/ProductoFormModal";
import StockModal from "../components/StockModal";
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from "../hooks/useProductos";
import type { Producto, ProductoPayload, StockPayload } from "../types/producto.types";

const columnHelper = createColumnHelper<Producto>();

function AdminProductosPage() {
  // El panel pide hasta 100 productos y pagina del lado del cliente con TanStack Table
  const { data, isLoading, isError, error, refetch } = useProductos({ skip: 0, limit: 100 });
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const cambiarStock = useActualizarStock();
  const eliminar = useEliminarProducto();

  const [formAbierto, setFormAbierto] = useState(false);
  const [stockAbierto, setStockAbierto] = useState(false);
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);

  const productos = data?.items ?? [];

  const cerrarModales = () => {
    setFormAbierto(false);
    setStockAbierto(false);
    setSeleccionado(null);
  };

  const handleSubmit = (payload: ProductoPayload) => {
    if (seleccionado) {
      actualizar.mutate({ id: seleccionado.id, payload }, { onSuccess: cerrarModales });
    } else {
      crear.mutate(payload, { onSuccess: cerrarModales });
    }
  };

  const handleStock = (payload: StockPayload) => {
    if (!seleccionado) return;
    cambiarStock.mutate({ id: seleccionado.id, payload }, { onSuccess: cerrarModales });
  };

  const handleEliminar = (producto: Producto) => {
    if (!window.confirm(`¿Eliminar el producto "${producto.nombre}"?`)) return;
    eliminar.mutate(producto.id);
  };

  const columns = [
    columnHelper.accessor("id", { header: "Número" }),
    columnHelper.accessor("nombre", { header: "Nombre" }),
    columnHelper.accessor((p) => p.categoria.nombre, { id: "categoria", header: "Categoría" }),
    columnHelper.accessor("precio_base", {
      header: "Precio base",
      cell: (info) => formatearPrecio(info.getValue()),
    }),
    columnHelper.accessor("stock", { header: "Stock" }),
    columnHelper.accessor("disponible", {
      header: "Disponible",
      cell: (info) => (info.getValue() ? "Sí" : "No"),
    }),
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="whitespace-nowrap text-right">
          <button
            onClick={() => {
              setSeleccionado(row.original);
              setFormAbierto(true);
            }}
            className="mr-3 font-medium text-blue-600 hover:underline"
          >
            Editar
          </button>
          <button
            onClick={() => {
              setSeleccionado(row.original);
              setStockAbierto(true);
            }}
            className="mr-3 font-medium text-blue-600 hover:underline"
          >
            Stock
          </button>
          <button
            onClick={() => handleEliminar(row.original)}
            className="font-medium text-red-600 hover:underline"
          >
            Eliminar
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: productos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button
          onClick={() => {
            setSeleccionado(null);
            setFormAbierto(true);
          }}
        >
          Nuevo producto
        </Button>
      </div>

      {isLoading && <EstadoCarga mensaje="Cargando productos..." />}
      {isError && (
        <EstadoError
          mensaje={getApiErrorMessage(error, "No se pudieron cargar los productos")}
          onReintentar={() => void refetch()}
        />
      )}
      {!isLoading && !isError && productos.length === 0 && (
        <EstadoVacio mensaje="No hay productos cargados todavía." />
      )}
      {!isLoading && !isError && productos.length > 0 && <TablaDatos table={table} />}

      {formAbierto && (
        <ProductoFormModal
          producto={seleccionado}
          onClose={cerrarModales}
          onSubmit={handleSubmit}
          guardando={crear.isPending || actualizar.isPending}
        />
      )}
      {stockAbierto && seleccionado && (
        <StockModal
          producto={seleccionado}
          onClose={cerrarModales}
          onSubmit={handleStock}
          guardando={cambiarStock.isPending}
        />
      )}
    </>
  );
}

export default AdminProductosPage;
