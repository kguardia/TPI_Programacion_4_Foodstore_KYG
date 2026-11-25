import { useEffect } from "react";
import AppRouter from "@/routes/AppRouter";
import Toast from "@/shared/components/Toast";
import { useAuthStore } from "@/store/authStore";

function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  // La única llamada en useEffect: confirmar la sesión al montar la aplicación
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}

export default App;
