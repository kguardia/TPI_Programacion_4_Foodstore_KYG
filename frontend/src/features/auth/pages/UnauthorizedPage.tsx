import { Link } from "react-router-dom";
import Card from "@/shared/ui/Card";

function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md text-center">
      <Card className="p-8">
        <h1 className="mb-2 text-2xl font-bold">Acceso denegado</h1>
        <p className="mb-6 text-slate-600">No tenés permisos para ver esta página.</p>
        <Link to="/" className="text-blue-600 hover:underline">
          Volver al inicio
        </Link>
      </Card>
    </div>
  );
}

export default UnauthorizedPage;
