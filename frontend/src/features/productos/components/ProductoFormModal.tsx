import { useForm } from "@tanstack/react-form";
import { useCategorias } from "@/features/categorias";
import Button from "@/shared/ui/Button";
import { Input, Select } from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import type { Producto, ProductoFormValues, ProductoPayload } from "../types/producto.types";

interface ProductoFormModalProps {
  producto: Producto | null; // null = alta, objeto = edición
  onClose: () => void;
  onSubmit: (payload: ProductoPayload) => void;
  guardando: boolean;
}

function ProductoFormModal({ producto, onClose, onSubmit, guardando }: ProductoFormModalProps) {
  const { data: categorias = [] } = useCategorias();

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      precio_base: producto ? String(producto.precio_base) : "",
      imagen_url: producto?.imagen_url ?? "",
      stock: producto ? String(producto.stock) : "0",
      disponible: producto?.disponible ?? true,
      categoria_id: producto ? String(producto.categoria_id) : "",
    } as ProductoFormValues,
    onSubmit: ({ value }) =>
      onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() === "" ? null : value.descripcion.trim(),
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() === "" ? null : value.imagen_url.trim(),
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      }),
  });

  return (
    <Modal isOpen title={producto ? "Editar producto" : "Nuevo producto"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => (value.trim() === "" ? "El nombre es obligatorio" : undefined),
          }}
        >
          {(field) => (
            <Input
              label="Nombre"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors.join(", ")}
            />
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <Input
              label="Descripción (opcional)"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          )}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) => (value === "" ? "Elegí una categoría" : undefined),
          }}
        >
          {(field) => (
            <Select
              label="Categoría"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={field.state.meta.errors.join(", ")}
            >
              <option value="">Seleccionar...</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) => {
                if (value.trim() === "") return "El precio es obligatorio";
                const n = Number(value);
                if (Number.isNaN(n) || n < 0) return "Debe ser un número mayor o igual a 0";
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                label="Precio base"
                type="number"
                min="0"
                step="0.01"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors.join(", ")}
              />
            )}
          </form.Field>

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
        </div>

        <form.Field name="imagen_url">
          {(field) => (
            <Input
              label="URL de la imagen (opcional)"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
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

export default ProductoFormModal;
