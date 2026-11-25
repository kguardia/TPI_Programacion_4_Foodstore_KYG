import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

const estilos = {
  success: "bg-green-600",
  error: "bg-red-600",
  info: "bg-slate-700",
} as const;

function Toast() {
  const message = useNotificationStore((s) => s.message);
  const type = useNotificationStore((s) => s.type);
  const visible = useNotificationStore((s) => s.visible);
  const id = useNotificationStore((s) => s.id);
  const hideNotification = useNotificationStore((s) => s.hideNotification);

  // Se oculta solo a los 3 segundos. Si llega otro aviso (cambia id), se reinicia.
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(hideNotification, 3000);
    return () => clearTimeout(timer);
  }, [visible, id, hideNotification]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${estilos[type]}`}
    >
      {message}
    </div>
  );
}

export default Toast;
