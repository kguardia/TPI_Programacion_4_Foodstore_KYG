// Mismos nombres de campo que los schemas del backend
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

export interface CategoriaFormValues {
  nombre: string;
  descripcion: string;
}

export interface CategoriaPayload {
  nombre: string;
  descripcion: string | null;
}
