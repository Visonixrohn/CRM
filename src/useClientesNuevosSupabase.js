import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ydowdpcladycccauvmob.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkb3dkcGNsYWR5Y2NjYXV2bW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTgxMTksImV4cCI6MjA3NDIzNDExOX0.W9FLueZVyuPXmEg7cx4qs4qWf8QspvdeO9Q9k97UALM";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function useClientesNuevosSupabase() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) setUsuarioId(userId);
  }, []);

  const fetchData = async () => {
    if (!usuarioId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("datos_personales")
        .select("*")
        .eq("usuario", usuarioId);
      if (error) throw error;
      setClientes(data || []);
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

  return { clientes, loading, error, refetch: fetchData };
}
