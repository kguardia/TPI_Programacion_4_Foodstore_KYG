import { useState } from "react";
import { useCategorias } from "@/features/categorias";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import Skeleton from "@/shared/components/Skeleton";
import { getApiErrorMessage } from "@/shared/api/handleApiError";
import { useDebounce } from "@/shared/hooks/useDebounce";
import ProductoCard from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const POR_PAGINA = 8;

function CatalogoPage() {
  const [page, setPage] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const search = useDebounce(busqueda.trim(), 400); // no consulta en cada tecla

  const { data: categorias = [] } = useCategorias();
  // Paginación en el servidor: skip = (página - 1) × límite
  const { data, isLoading, isError, error, refetch } = useProductos({
    skip: (page - 1) * POR_PAGINA,
    limit: POR_PAGINA,
    search: search === "" ? undefined : search,
    categoria_id: categoriaId === "" ? undefined : Number(categoriaId),
  });

  const totalPages = data ? Math.ceil(data.total / POR_PAGINA) : 1;

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Catálogo</h1>

      <div className="mb-6 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-xs rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select
          aria-label="Filtrar por categoría"
          value={categoriaId}
          onChange={(e) => {
            setCategoriaId(e.target.value);
            setPage(1);
          }}
          className="rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Cargando productos"
          data-testid="skeleton"
        >
          {Array.from({ length: POR_PAGINA }, (_, i) => (
            <div key={i} className="rounded-lg bg-white p-4 shadow">
              <Skeleton className="mb-3 h-36 w-full" />
              <Skeleton className="mb-2 h-4 w-1/3" />
              <Skeleton className="mb-2 h-5 w-2/3" />
              <Skeleton className="mb-4 h-4 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <EstadoError
          mensaje={getApiErrorMessage(error, "No se pudo cargar el catálogo")}
          onReintentar={() => void refetch()}
        />
      )}

      {data && data.items.length === 0 && (
        <EstadoVacio mensaje="No se encontraron productos con esos filtros." />
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Paginacion page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </>
  );
}

export default CatalogoPage;
