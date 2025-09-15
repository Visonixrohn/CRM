import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function useClientesParaHoy() {
  const [cantidad, setCantidad] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchClientes() {
      setLoading(true);
      setError(null);
      try {
        const userId = localStorage.getItem("userId");
        const hoy = new Date().toISOString().slice(0, 10);
        const { data, error } = await supabase
          .from("seguimiento")
          .select("id")
          .eq("id_usuario", userId)
          .eq("estado", "Gestionado")
          .eq("fecha_de_acuerdo", hoy);
        if (error) throw error;
        setCantidad(data.length);
      } catch (e) {
        setError(e.message || e);
      } finally {
        setLoading(false);
      }
    }
    fetchClientes();
  }, []);

  return { cantidad, loading, error };
}
