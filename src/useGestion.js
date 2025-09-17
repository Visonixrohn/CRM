import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";



export default function useGestion(update) {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
  const [miTienda, setMiTienda] = useState(null);
  const [total, setTotal] = useState(0);
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) setUsuarioId(userId);
    // Obtener mi_tienda del usuario logueado
    const fetchTienda = async () => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("mi_tienda")
        .eq("id", userId)
        .maybeSingle();
      if (data && data.mi_tienda) setMiTienda(data.mi_tienda);
    };
    fetchTienda();
  }, []);

  useEffect(() => {
    if (!usuarioId || !miTienda) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        // Filtrar: usuario = usuario actual o NULL, y tienda_fidelidad = mi_tienda
        const { data, error } = await supabase
          .from('gestion')
          .select('*')
          .or(`usuario.eq.${usuarioId},usuario.is.null`)
          .eq('tienda_fidelidad', miTienda);
        if (error) throw error;
        const mapped = (data || []).map(row => ({
          ID: row.no_identificacion,
          NOMBRES: row.nombre,
          APELLIDOS: row.apellidos,
          TELEFONO: row.telefono,
          TIENDA: row.tienda_fidelidad,
          estado: row.estado || '',
          ...row
        }));
        setDatos(mapped);
        setTotal((data || []).length);
        setPendientes((data || []).filter(row => (row.status || row.STATUS) !== "Tomado").length);
      } catch (err) {
        setDatos([]);
        setTotal(0);
        setPendientes(0);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [usuarioId, miTienda, update]);

  return { datos, loading, error, total, pendientes };
}
