import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAuth } from "@/features/auth";
import { getApiErrorMessage } from "@/shared/api/handleApiError";
import EstadoCarga from "@/shared/components/EstadoCarga";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import TablaDatos from "@/shared/components/TablaDatos";
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from "../hooks/useUsuarios";
import type { Usuario } from "../types/usuario.types";

const columnHelper = createColumnHelper<Usuario>();

function AdminUsuariosPage() {
  const { usuario: actual } = useAuth();
  const { data, isLoading, isError, error, refetch } = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();

  const usuarios = data ?? [];

  const columns = [
    columnHelper.accessor("username", { header: "Usuario" }),
    columnHelper.accessor("full_name", { header: "Nombre" }),
    columnHelper.accessor("email", { header: "Email" }),
    columnHelper.accessor("role", { header: "Rol" }),
    columnHelper.accessor("disabled", {
      header: "Estado",
      cell: (info) =>
        info.getValue() ? (
          <span className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
            Desactivado
          </span>
        ) : (
          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            Activo
          </span>
        ),
    }),
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const u = row.original;
        if (u.disabled) {
          return (
            <button
              onClick={() => activar.mutate(u.id)}
              disabled={activar.isPending}
              className="font-medium text-green-700 hover:underline disabled:opacity-50"
            >
              Activar
            </button>
          );
        }
        // El botón Desactivar no se muestra en la fila del usuario de la sesión
        if (u.id === actual?.id) return <span className="text-slate-400">—</span>;
        return (
          <button
            onClick={() => desactivar.mutate(u.id)}
            disabled={desactivar.isPending}
            className="font-medium text-red-600 hover:underline disabled:opacity-50"
          >
            Desactivar
          </button>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: usuarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 8 } },
  });

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Usuarios</h1>

      {isLoading && <EstadoCarga mensaje="Cargando usuarios..." />}
      {isError && (
        <EstadoError
          mensaje={getApiErrorMessage(error, "No se pudieron cargar los usuarios")}
          onReintentar={() => void refetch()}
        />
      )}
      {!isLoading && !isError && usuarios.length === 0 && (
        <EstadoVacio mensaje="No hay usuarios registrados." />
      )}
      {!isLoading && !isError && usuarios.length > 0 && <TablaDatos table={table} />}
    </>
  );
}

export default AdminUsuariosPage;
