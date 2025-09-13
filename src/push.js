// src/push.js
// Componente React para enviar una notificación push al recargar la página
import { useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function Push() {
  useEffect(() => {
  let intervalId;
  let lastNotifiedHash = null;
    async function notify() {
      // Detectar si es móvil (Android/iOS)
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) return;
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

      // Agrupar entregas pendientes para hoy o atrasadas
      const paraHoy = entregas.filter(e => String(e.estatus).toLowerCase() !== 'entregado' && e.fecha_entrega === hoyStr);
      const atrasadas = entregas.filter(e => String(e.estatus).toLowerCase() !== 'entregado' && e.fecha_entrega < hoyStr);
      if (paraHoy.length > 0 || atrasadas.length > 0) {
        // Crear un hash simple de la lista para evitar notificaciones duplicadas
        const hash = [...paraHoy, ...atrasadas].map(e => `${e.id}:${e.fecha_entrega}:${e.estatus}`).join('|');
        if (hash !== lastNotifiedHash) {
          let body = `Hola ${user.nombre || ''}, el día de hoy tienes`;
          if (paraHoy.length > 0) body += `\n${paraHoy.length} entrega(s) para hoy`;
          if (atrasadas.length > 0) body += `\n${atrasadas.length} atrasada(s)`;
          new Notification('CRM', {
            body,
            icon: '/icon-192.png',
          });
          lastNotifiedHash = hash;
        }
      } else {
        lastNotifiedHash = null;
      }
    }
    notify();
    intervalId = setInterval(notify, 15000);
    return () => clearInterval(intervalId);
  }, []);
  return null;
}
