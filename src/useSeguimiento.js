import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function useSeguimiento() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("seguimiento")
        .select("*")
        .order("id", { ascending: false });
      if (error) throw error;
      setDatos(data || []);
    } catch (e) {
      setError(e.message || e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  return { datos, loading, error, refetch: fetchDatos };
}
