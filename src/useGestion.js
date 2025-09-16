import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";



export default function useGestion(update) {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
  const [total, setTotal] = useState(0);
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) setUsuarioId(userId);
  }, []);

  useEffect(() => {
    if (!usuarioId) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('gestion')
          .select('*')
          .eq('usuario', usuarioId);
        if (error) throw error;
        // Mapear columnas de Supabase a nombres esperados en la UI
        const mapped = (data || []).map(row => ({
          ID: row.no_identificacion,
          NOMBRES: row.nombre,
          APELLIDOS: row.apellidos,
          TELEFONO: row.telefono,
          TIENDA: row.tienda_fidelidad,
          estado: row.estado || '',
          ...row // mantener el resto de campos originales
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
  }, [usuarioId, update]);

  return { datos, loading, error, total, pendientes };
}
