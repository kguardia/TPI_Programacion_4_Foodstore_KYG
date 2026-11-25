import axios from "axios";

interface ErrorDetail {
  detail?: string | { msg?: string; loc?: (string | number)[] }[];
}

// Convierte cualquier error en un mensaje para mostrar en pantalla.
// El backend responde { "detail": "..." } (o una lista en los 422).
export function getApiErrorMessage(
  error: unknown,
  porDefecto = "Ocurrió un error inesperado"
): string {
  if (axios.isAxiosError<ErrorDetail>(error)) {
    if (!error.response) return "No se pudo conectar con el servidor";
    const detail = error.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d) => {
          const campo = d.loc?.[d.loc.length - 1];
          return campo !== undefined ? `${String(campo)}: ${d.msg ?? ""}` : (d.msg ?? "");
        })
        .join(". ");
    }
  }
  return error instanceof Error ? error.message : porDefecto;
}
