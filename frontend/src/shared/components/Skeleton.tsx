// Bloque gris animado que se muestra mientras cargan los datos
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} aria-hidden="true" />;
}

export default Skeleton;
