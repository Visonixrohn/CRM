// src/push.js
// Componente React para enviar una notificación push al recargar la página
import { useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function Push() {
  useEffect(() => {
    async function notify() {
      if (!("Notification" in window)) return;
      let permission = Notification.permission;
      if (permission !== "granted") {
        permission = await Notification.requestPermission();
      }
      if (permission !== "granted") return;

      // Obtener usuario autenticado
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("id, nombre")
        .eq("id", userId)
        .maybeSingle();
      if (userError || !user) return;

      // Obtener entregas pendientes del usuario
      const { data: entregas, error: entregasError } = await supabase
        .from("entregas_pendientes")
        .select("id, cliente, fecha_entrega, estatus")
        .eq("usuario_id", user.id);
      if (entregasError || !entregas) return;

      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      const hoyStr = `${yyyy}-${mm}-${dd}`;

      // Notificar por cada entrega pendiente para hoy
      entregas.forEach(e => {
        if (String(e.estatus).toLowerCase() === 'entregado') return;
        if (e.fecha_entrega === hoyStr) {
          new Notification(`Hola ${user.nombre || ''}!`, {
            body: `Tienes entrega pendiente para hoy del cliente ${e.cliente}`
          });
        } else if (e.fecha_entrega < hoyStr) {
          new Notification(`Hola ${user.nombre || ''}!`, {
            body: `Entrega atrasada: cliente ${e.cliente}`
          });
        }
      });
    }
    notify();
  }, []);
  return null;
}
