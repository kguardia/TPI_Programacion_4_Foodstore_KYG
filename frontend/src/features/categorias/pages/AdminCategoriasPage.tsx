import { useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import EstadoCarga from "@/shared/components/EstadoCarga";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import TablaDatos from "@/shared/components/TablaDatos";
import Button from "@/shared/ui/Button";
import { getApiErrorMessage } from "@/shared/api/handleApiError";
import CategoriaFormModal from "../components/CategoriaFormModal";
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from "../hooks/useCategorias";
import type { Categoria, CategoriaPayload } from "../types/categoria.types";

const columnHelper = createColumnHelper<Categoria>();

function AdminCategoriasPage() {
  const { data, isLoading, isError, error, refetch } = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();

  // Estado de la interfaz: qué modal está abierto
  const [modalAbierto, setModalAbierto] = useState(false);
  const [seleccionada, setSeleccionada] = useState<Categoria | null>(null);

  const categorias = data ?? [];

  const cerrarModal = () => {
    setModalAbierto(false);
    setSeleccionada(null);
  };

  const handleSubmit = (payload: CategoriaPayload) => {
    if (seleccionada) {
      actualizar.mutate({ id: seleccionada.id, payload }, { onSuccess: cerrarModal });
    } else {
      crear.mutate(payload, { onSuccess: cerrarModal });
    }
  };

  const handleEliminar = (categoria: Categoria) => {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) return;
    eliminar.mutate(categoria.id);
  };

  const columns = [
    columnHelper.accessor("id", { header: "Número" }),
    columnHelper.accessor("nombre", { header: "Nombre" }),
    columnHelper.accessor("descripcion", {
      header: "Descripción",
      cell: (info) => info.getValue() ?? "—",
    }),
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="text-right">
          <button
            onClick={() => {
              setSeleccionada(row.original);
              setModalAbierto(true);
            }}
            className="mr-3 font-medium text-blue-600 hover:underline"
          >
            Editar
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
    data: categorias,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button
          onClick={() => {
            setSeleccionada(null);
            setModalAbierto(true);
          }}
        >
          Nueva categoría
        </Button>
      </div>

      {isLoading && <EstadoCarga mensaje="Cargando categorías..." />}
      {isError && (
        <EstadoError
          mensaje={getApiErrorMessage(error, "No se pudieron cargar las categorías")}
          onReintentar={() => void refetch()}
        />
      )}
      {!isLoading && !isError && categorias.length === 0 && (
        <EstadoVacio mensaje="No hay categorías cargadas todavía." />
      )}
      {!isLoading && !isError && categorias.length > 0 && <TablaDatos table={table} />}

      {modalAbierto && (
        <CategoriaFormModal
          categoria={seleccionada}
          onClose={cerrarModal}
          onSubmit={handleSubmit}
          guardando={crear.isPending || actualizar.isPending}
        />
      )}
    </>
  );
}

export default AdminCategoriasPage;
