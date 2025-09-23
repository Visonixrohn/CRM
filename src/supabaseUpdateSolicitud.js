// Actualiza el campo STATUS en Supabase para una solicitud
export async function actualizarStatusSupabase(id, nuevoStatus) {
  const url = "https://ydowdpcladycccauvmob.supabase.co/rest/v1/datos_personales";
  try {
    const resp = await fetch(`${url}?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkb3dkcGNsYWR5Y2NjYXV2bW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTgxMTksImV4cCI6MjA3NDIzNDExOX0.W9FLueZVyuPXmEg7cx4qs4qWf8QspvdeO9Q9k97UALM",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkb3dkcGNsYWR5Y2NjYXV2bW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTgxMTksImV4cCI6MjA3NDIzNDExOX0.W9FLueZVyuPXmEg7cx4qs4qWf8QspvdeO9Q9k97UALM"
      },
      body: JSON.stringify({ STATUS: nuevoStatus })
    });
    if (!resp.ok) {
      const error = await resp.text();
      throw new Error(error);
    }
    // Si la respuesta está vacía, no intentar parsear JSON
    const text = await resp.text();
    if (!text) return {};
    try {
      return JSON.parse(text);
    } catch (e) {
      // Si no es JSON, devolver el texto plano
      return { raw: text };
    }
  } catch (err) {
    throw err;
  }
}
