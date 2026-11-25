import { useForm } from "@tanstack/react-form";
import Button from "@/shared/ui/Button";
import { Input, Select } from "@/shared/ui/Input";
import type { CheckoutFormValues } from "../types/pedido.types";

interface CheckoutFormProps {
  onSubmit: (values: CheckoutFormValues) => Promise<void>;
  error: string | null;
}

function CheckoutForm({ onSubmit, error }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO",
      notas: "",
    } as CheckoutFormValues,
    onSubmit: async ({ value }) => onSubmit(value),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo === 0) return "La dirección es obligatoria";
            if (largo < 5 || largo > 200) return "Debe tener entre 5 y 200 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            label="Dirección de entrega"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={field.state.meta.errors.join(", ")}
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <Select
            label="Forma de pago"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value as CheckoutFormValues["forma_pago"])}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </Select>
        )}
      </form.Field>

      <form.Field name="notas">
        {(field) => (
          <Input
            label="Notas (opcional)"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      </form.Field>

      {error && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Confirmando..." : "Confirmar pedido"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

export default CheckoutForm;
