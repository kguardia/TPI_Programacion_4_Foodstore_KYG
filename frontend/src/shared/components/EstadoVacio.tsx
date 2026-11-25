function EstadoVacio({ mensaje }: { mensaje: string }) {
  return (
    <p className="rounded-lg bg-white p-8 text-center text-slate-500 shadow">{mensaje}</p>
  );
}

export default EstadoVacio;
