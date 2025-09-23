import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

/**
 * Hook para obtener la tienda del usuario logueado desde Supabase.
 * Retorna el nombre de la tienda o string vacío si no existe.
 */
export default function useTiendaUsuario(userId) {
  const [tienda, setTienda] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTienda() {
      if (!userId) {
        setTienda("");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("mi_tienda")
        .eq("id", userId)
        .maybeSingle();
      if (error || !data) setTienda("");
      else setTienda(data.mi_tienda || "");
      setLoading(false);
    }
    fetchTienda();
  }, [userId]);

  return { tienda, loading };
}
