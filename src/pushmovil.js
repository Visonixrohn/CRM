// src/pushmovil.js
// Componente React para enviar notificación solo en móviles/tablets
import { useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function PushMovil() {
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;
    let lastNotifiedHash = null;
    let intervalId;
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

      // Agrupar entregas pendientes para hoy o atrasadas
      const pendientes = entregas.filter(e => {
        if (String(e.estatus).toLowerCase() === 'entregado') return false;
        return e.fecha_entrega === hoyStr || e.fecha_entrega < hoyStr;
      });
      if (pendientes.length > 0) {
        let body = pendientes.map(e => {
          let estado = e.fecha_entrega === hoyStr ? 'para hoy' : 'atrasada';
          return `${e.cliente} = ${estado}`;
        }).join('\n');
        // Crear un hash simple de la lista para evitar notificaciones duplicadas
        const hash = pendientes.map(e => `${e.id}:${e.fecha_entrega}:${e.estatus}`).join('|');
        if (hash !== lastNotifiedHash) {
          new Notification(`Hola ${user.nombre || ''}!`, {
            body: `Tienes estas entregas pendientes:\n${body}`
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
