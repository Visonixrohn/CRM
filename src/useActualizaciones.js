import { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';

// Cliente exclusivo para actualizacion_datos
const actualizacionesUrl = 'https://ydowdpcladycccauvmob.supabase.co';
const actualizacionesKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkb3dkcGNsYWR5Y2NjYXV2bW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTgxMTksImV4cCI6MjA3NDIzNDExOX0.W9FLueZVyuPXmEg7cx4qs4qWf8QspvdeO9Q9k97UALM';
const supabaseActualizaciones = createClient(actualizacionesUrl, actualizacionesKey);



export default function useActualizaciones() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    console.log('ID de usuario logueado:', userId);
    if (userId) setUsuarioId(userId);
  }, []);

  const fetchData = async () => {
    if (!usuarioId) return;
    setLoading(true);
    try {
        const { data, error } = await supabaseActualizaciones
        .from("actualizacion_datos")
        .select()
        .eq("usuario_id", usuarioId);
      if (error) throw new Error(error.message);
  console.log('Datos recibidos de Supabase actualizacion_datos:', data);
  setDatos(data || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [usuarioId]);

  return { datos, loading, error, refetch: fetchData };
}
