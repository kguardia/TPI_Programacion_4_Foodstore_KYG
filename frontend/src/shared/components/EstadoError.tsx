interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p>{mensaje}</p>
      {onReintentar && (
        <button
          onClick={onReintentar}
          className="mt-2 rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}

export default EstadoError;
