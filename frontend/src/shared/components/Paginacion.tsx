interface PaginacionProps {
  page: number; // empieza en 1
  totalPages: number;
  onChange: (page: number) => void;
}

function Paginacion({ page, totalPages, onChange }: PaginacionProps) {
  const boton =
    "rounded bg-slate-200 px-3 py-1 text-sm hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50";
  return (
    <nav className="mt-6 flex items-center justify-center gap-4" aria-label="Paginación">
      <button className={boton} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </button>
      <span className="text-sm text-slate-600">
        Página {page} de {Math.max(totalPages, 1)}
      </span>
      <button className={boton} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Siguiente
      </button>
    </nav>
  );
}

export default Paginacion;
