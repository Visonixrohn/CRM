// Supabase Edge Function: reset-password
// Permite resetear la contraseña de un usuario por su UID (solo con API Key de servicio)
import { serve } from 'std/server';

serve(async (req) => {
  const { uid, new_password, service_key } = await req.json();
  if (!uid || !new_password || !service_key) {
    return new Response(JSON.stringify({ error: 'Faltan parámetros' }), { status: 400 });
  }

  // Validar la key de servicio
  if (service_key !== Deno.env.get('SUPABASE_SERVICE_KEY')) {
    return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
  }

  // Llamar a la API de Supabase Auth Admin
  const projectUrl = Deno.env.get('SUPABASE_PROJECT_URL');
  const adminKey = Deno.env.get('SUPABASE_SERVICE_KEY');
  const url = `${projectUrl}/auth/v1/admin/users/${uid}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': adminKey,
      'Authorization': `Bearer ${adminKey}`
    },
    body: JSON.stringify({ password: new_password })
  });
  const data = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify({ error: data.error || 'Error al resetear contraseña' }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
