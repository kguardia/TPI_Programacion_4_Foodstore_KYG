import { api } from "@/shared/api/axiosInstance";
import type { RegisterValues, Usuario } from "../types/auth.types";

export async function registrarUsuario(datos: RegisterValues): Promise<Usuario> {
  const { data } = await api.post<Usuario>("/auth/register", datos);
  return data;
}
