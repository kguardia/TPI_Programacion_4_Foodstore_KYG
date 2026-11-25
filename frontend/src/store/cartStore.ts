import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen_url: string | null;
  stock: number; // tope de unidades que se pueden pedir
}

interface CartState {
  items: ItemCarrito[];
  // Devuelve false si ya se alcanzó el stock disponible
  agregar: (item: Omit<ItemCarrito, "cantidad">, cantidad?: number) => boolean;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (item, cantidad = 1) => {
        const existente = get().items.find((i) => i.producto_id === item.producto_id);
        const actual = existente?.cantidad ?? 0;
        const nueva = Math.min(actual + cantidad, item.stock);
        if (nueva <= actual) return false;
        if (existente) {
          set({
            items: get().items.map((i) =>
              i.producto_id === item.producto_id ? { ...i, ...item, cantidad: nueva } : i
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, cantidad: nueva }] });
        }
        return true;
      },

      quitar: (productoId) =>
        set({ items: get().items.filter((i) => i.producto_id !== productoId) }),

      cambiarCantidad: (productoId, cantidad) =>
        set({
          items: get()
            .items.map((i) =>
              i.producto_id === productoId
                ? { ...i, cantidad: Math.min(cantidad, i.stock) }
                : i
            )
            .filter((i) => i.cantidad > 0),
        }),

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }), // solo los ítems (total es derivado)
    }
  )
);
