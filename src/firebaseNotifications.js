import { messaging, getToken, onMessage } from "./firebase";

// Solicitar permiso y obtener token para notificaciones push
export async function requestFirebaseNotificationPermission() {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: "BMGDm4VNYmXHuc3tQ6ErywVzLTa3JqI2Q_COEYd_QHloKHzqLKxN3nA3YTwu2CAf_XXjPa1qocJkJVqlJnOX8SA"
    });
    if (currentToken) {
      console.log("Token de notificación FCM:", currentToken);
      // Aquí puedes enviar el token a tu backend si lo necesitas
      return currentToken;
    } else {
      console.warn("No se pudo obtener el token de notificación.");
      return null;
    }
  } catch (err) {
    console.error("Error al obtener el token de notificación:", err);
    return null;
  }
}

// Escuchar mensajes cuando la app está en primer plano
export function onFirebaseMessage(callback) {
  onMessage(messaging, callback);
}