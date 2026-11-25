function EstadoCarga({ mensaje = "Cargando..." }: { mensaje?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-lg bg-white p-8 shadow">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
      <p className="text-slate-600">{mensaje}</p>
    </div>
  );
}

export default EstadoCarga;
