import { getApiErrorMessage } from "@/shared/api/handleApiError";
import EstadoCarga from "@/shared/components/EstadoCarga";
import EstadoError from "@/shared/components/EstadoError";
import { formatearPrecio } from "@/shared/utils/format";
import ResumenCard from "../components/ResumenCard";
import { useResumenPedidos } from "../hooks/usePedidos";

function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos();

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Resumen del negocio</h1>

      {isLoading && <EstadoCarga mensaje="Cargando indicadores..." />}
      {isError && (
        <EstadoError
          mensaje={getApiErrorMessage(error, "No se pudo cargar el resumen")}
          onReintentar={() => void refetch()}
        />
      )}
      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pedidos pendientes" valor={data.pendientes} />
          <ResumenCard titulo="En preparación" valor={data.en_preparacion} />
          <ResumenCard titulo="Entregados" valor={data.entregados} />
          <ResumenCard titulo="Cancelados" valor={data.cancelados} />
          <ResumenCard titulo="Pedidos de hoy" valor={data.pedidos_hoy} />
          <ResumenCard titulo="Ingresos (entregados)" valor={formatearPrecio(data.ingresos_entregados)} />
        </div>
      )}
    </>
  );
}

export default AdminResumenPage;
