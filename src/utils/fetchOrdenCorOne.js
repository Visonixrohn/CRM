// Utilidad para obtener datos de la API externa de cor-one
export async function fetchOrdenCorOne(orderId) {
  try {
    console.log('[cor-one] Consultando:', orderId);
    // Usar el proxy backend local para evitar CORS
    const resp = await fetch(`/api/orden?order_id=${orderId}`);
    console.log('[cor-one] Status:', resp.status);
    if (!resp.ok) throw new Error('No se pudo consultar la orden');
    const data = await resp.json();
    console.log('[cor-one] Respuesta:', data);
    // Adaptar: si datos es objeto, convertir a array
    if (!data.datos) return null;
    if (Array.isArray(data.datos)) {
      if (!data.datos[0]) return null;
      return data.datos[0];
    } else if (typeof data.datos === 'object') {
      return data.datos;
    } else {
      return null;
    }
  } catch (e) {
    console.error('[cor-one] Error:', e);
    return null;
  }
}
