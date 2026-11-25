import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { getApiErrorMessage } from "@/shared/api/handleApiError";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { useRegister } from "../hooks/useRegister";
import type { RegisterValues } from "../types/auth.types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterPage() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const registrar = useRegister();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "" } as RegisterValues,
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await registrar.mutateAsync({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        navigate("/login", { state: { registrado: true } });
      } catch (err) {
        setErrorServidor(getApiErrorMessage(err, "No se pudo completar el registro"));
      }
    },
  });

  if (usuario) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-md">
      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <h1 className="mb-4 text-2xl font-bold">Crear cuenta</h1>

          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) => {
                const v = value.trim();
                if (v === "") return "El usuario es obligatorio";
                if (v.length < 3) return "Mínimo 3 caracteres";
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                label="Usuario"
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors.join(", ")}
              />
            )}
          </form.Field>

          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim() === "" ? "El nombre completo es obligatorio" : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors.join(", ")}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (value.trim() === "") return "El email es obligatorio";
                if (!EMAIL_REGEX.test(value.trim())) return "Ingresá un email válido";
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                label="Email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors.join(", ")}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) => {
                if (value === "") return "La contraseña es obligatoria";
                if (value.length < 8) return "Mínimo 8 caracteres";
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={field.state.meta.errors.join(", ")}
              />
            )}
          </form.Field>

          {errorServidor && (
            <p className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {errorServidor}
            </p>
          )}

          <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrarme"}
              </Button>
            )}
          </form.Subscribe>

          <p className="mt-4 text-center text-sm text-slate-600">
            ¿Ya tenés cuenta?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Ingresá
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}

export default RegisterPage;
