import { flexRender, type Table } from "@tanstack/react-table";

interface TablaDatosProps<T> {
  table: Table<T>;
}

// Tabla genérica: las columnas y la paginación del lado del cliente vienen en `table`
function TablaDatos<T>({ table }: TablaDatosProps<T>) {
  const { pageIndex } = table.getState().pagination;
  const boton =
    "rounded bg-slate-200 px-3 py-1 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow">
      <table className="w-full text-left">
        <thead className="bg-slate-100 text-xs uppercase text-slate-500">
          {table.getHeaderGroups().map((grupo) => (
            <tr key={grupo.id}>
              {grupo.headers.map((header) => (
                <th key={header.id} className="px-4 py-3">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((fila) => (
            <tr key={fila.id} className="border-b border-slate-200 hover:bg-slate-50">
              {fila.getVisibleCells().map((celda) => (
                <td key={celda.id} className="px-4 py-3 text-sm">
                  {flexRender(celda.column.columnDef.cell, celda.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
        <button
          className={boton}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </button>
        <span className="text-slate-600">
          Página {pageIndex + 1} de {Math.max(table.getPageCount(), 1)}
        </span>
        <button
          className={boton}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default TablaDatos;
