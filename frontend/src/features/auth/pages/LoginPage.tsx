import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "@tanstack/react-form";
import { getApiErrorMessage } from "@/shared/api/handleApiError";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { Input } from "@/shared/ui/Input";
import { useAuth } from "../hooks/useAuth";
import type { LoginValues } from "../types/auth.types";

interface LocationState {
  registrado?: boolean;
  from?: { pathname: string };
}

function LoginPage() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const state = useLocation().state as LocationState | null;
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { username: "", password: "" } as LoginValues,
    onSubmit: async ({ value }) => {
      setErrorServidor(null);
      try {
        await login(value.username.trim(), value.password);
        navigate(state?.from?.pathname ?? "/", { replace: true });
      } catch (err) {
        setErrorServidor(getApiErrorMessage(err, "No se pudo iniciar sesión"));
      }
    },
  });

  // Si ya hay sesión no tiene sentido ver el login
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
          <h1 className="mb-4 text-2xl font-bold">Iniciar sesión</h1>

          {state?.registrado && (
            <p className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              Registro exitoso. Ya podés iniciar sesión.
            </p>
          )}

          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim() === "" ? "El usuario es obligatorio" : undefined,
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
            name="password"
            validators={{
              onChange: ({ value }) => (value === "" ? "La contraseña es obligatoria" : undefined),
            }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                type="password"
                autoComplete="current-password"
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
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </Button>
            )}
          </form.Subscribe>

          <p className="mt-4 text-center text-sm text-slate-600">
            ¿No tenés cuenta?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Registrate
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}

export default LoginPage;
