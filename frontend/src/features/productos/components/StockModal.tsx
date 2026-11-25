import { useForm } from "@tanstack/react-form";
import Button from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import type { Producto, StockPayload } from "../types/producto.types";

interface StockModalProps {
  producto: Producto;
  onClose: () => void;
  onSubmit: (payload: StockPayload) => void;
  guardando: boolean;
}

// Cambio rápido de stock y disponibilidad (PATCH /productos/{id}/stock)
function StockModal({ producto, onClose, onSubmit, guardando }: StockModalProps) {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: ({ value }) =>
      onSubmit({ stock: Number(value.stock), disponible: value.disponible }),
  });

  return (
    <Modal isOpen title={`Stock de ${producto.nombre}`} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => {
              const n = Number(value);
              if (value.trim() === "" || !Number.isInteger(n) || n < 0)
                return "Debe ser un entero mayor o igual a 0";
              return undefined;
            },
          }}
        >
          {(field) => (
            <Input
              label="Stock"
              type="number"
              min="0"
              step="1"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors.join(", ")}
            />
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="mb-4 flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <form.Subscribe selector={(s) => s.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" disabled={!canSubmit || guardando}>
                {guardando ? "Guardando..." : "Guardar"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
}

export default StockModal;
