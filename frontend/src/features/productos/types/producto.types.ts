import type { Categoria } from "@/features/categorias";

// Mismos nombres de campo que los schemas del backend
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria_id: number;
  categoria: Categoria;
}

export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

export interface FiltrosProductos {
  skip: number;
  limit: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}

// Lo que se envía al crear o editar un producto
export interface ProductoPayload {
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

export interface StockPayload {
  stock: number;
  disponible: boolean;
}

// Valores del formulario (los números se escriben como texto en los inputs)
export interface ProductoFormValues {
  nombre: string;
  descripcion: string;
  precio_base: string;
  imagen_url: string;
  stock: string;
  disponible: boolean;
  categoria_id: string;
}
