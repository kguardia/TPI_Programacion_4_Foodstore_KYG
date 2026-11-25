// Mismos nombres de campo que el schema UserPublic del backend
export type Rol = "user" | "admin";

export interface Usuario {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
}

export interface LoginValues {
  username: string;
  password: string;
}

export interface RegisterValues {
  username: string;
  full_name: string;
  email: string;
  password: string;
}
