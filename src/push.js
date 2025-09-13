// src/push.js
// Componente React para enviar una notificación push al recargar la página
import { useEffect } from "react";

export default function Push() {
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Hola mundo");
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("Hola mundo");
          }
        });
      }
    }
  }, []);
  return null;
}
