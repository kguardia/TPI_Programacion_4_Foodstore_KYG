import { useEffect, useState } from "react";

// Devuelve el valor recién después de que dejó de cambiar durante `demora` ms
export function useDebounce<T>(valor: T, demora = 400): T {
  const [debounced, setDebounced] = useState(valor);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(valor), demora);
    return () => clearTimeout(timer);
  }, [valor, demora]);
  return debounced;
}
