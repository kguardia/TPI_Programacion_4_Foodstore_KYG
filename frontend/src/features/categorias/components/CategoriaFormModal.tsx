import { useForm } from "@tanstack/react-form";
import Button from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import Modal from "@/shared/ui/Modal";
import type { Categoria, CategoriaFormValues, CategoriaPayload } from "../types/categoria.types";

interface CategoriaFormModalProps {
  categoria: Categoria | null; // null = alta, objeto = edición
  onClose: () => void;
  onSubmit: (payload: CategoriaPayload) => void;
  guardando: boolean;
}

function CategoriaFormModal({ categoria, onClose, onSubmit, guardando }: CategoriaFormModalProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? "",
      descripcion: categoria?.descripcion ?? "",
    } as CategoriaFormValues,
    onSubmit: ({ value }) =>
      onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() === "" ? null : value.descripcion.trim(),
      }),
  });

  return (
    <Modal isOpen title={categoria ? "Editar categoría" : "Nueva categoría"} onClose={onClose}>
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
            onChange: ({ value }) => {
              const v = value.trim();
              if (v === "") return "El nombre es obligatorio";
              if (v.length < 2 || v.length > 100) return "Debe tener entre 2 y 100 caracteres";
              return undefined;
            },
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

export default CategoriaFormModal;
