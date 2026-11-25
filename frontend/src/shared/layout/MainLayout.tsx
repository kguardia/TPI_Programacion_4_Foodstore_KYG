import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

// Reúne la Navbar y el contenido de la ruta activa
function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
