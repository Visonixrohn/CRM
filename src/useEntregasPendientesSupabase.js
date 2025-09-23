import { useEffect, useState } from "react";

export default function useEntregasPendientesSupabase() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPendientes() {
      setLoading(true);
      try {
        const resp = await fetch(
          "https://ydowdpcladycccauvmob.supabase.co/rest/v1/entregas?STATUS=eq.Pendiente",
          {
            headers: {
              "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkb3dkcGNsYWR5Y2NjYXV2bW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTgxMTksImV4cCI6MjA3NDIzNDExOX0.W9FLueZVyuPXmEg7cx4qs4qWf8QspvdeO9Q9k97UALM",
              "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkb3dkcGNsYWR5Y2NjYXV2bW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTgxMTksImV4cCI6MjA3NDIzNDExOX0.W9FLueZVyuPXmEg7cx4qs4qWf8QspvdeO9Q9k97UALM"
            }
          }
        );
        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        // Filtrar entregas atrasadas o para hoy
        const hoy = new Date();
        hoy.setHours(0,0,0,0);
        const filtradas = data.filter((n) => {
          let fechaEntrega = n.FechaEntrega || n.fecha_entrega || n.fecha || n.fechaEntrega;
          if (!fechaEntrega) return false;
          let fecha;
          // Soporte para formato YYYY-MM-DD
          if (/^\d{4}-\d{2}-\d{2}$/.test(fechaEntrega)) {
            fecha = new Date(fechaEntrega + 'T00:00:00');
          } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(fechaEntrega)) {
            // DD/MM/YYYY
            const [d, m, y] = fechaEntrega.split('/');
            fecha = new Date(`${y}-${m}-${d}T00:00:00`);
          } else {
            fecha = new Date(fechaEntrega);
          }
          fecha.setHours(0,0,0,0);
          return fecha <= hoy;
        });
        setNotificaciones(filtradas);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPendientes();
  }, []);

  return { notificaciones, loading, error };
}
