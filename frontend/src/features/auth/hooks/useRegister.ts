import { useMutation } from "@tanstack/react-query";
import { registrarUsuario } from "../api/auth";

export function useRegister() {
  return useMutation({ mutationFn: registrarUsuario });
}
