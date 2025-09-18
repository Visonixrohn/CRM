import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";



export default function useGestion(update, filtroEstado = null) {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
  const [miTienda, setMiTienda] = useState(null);
  const [total, setTotal] = useState(0);
  const [gestionadosHoy, setGestionadosHoy] = useState(0);
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
        // 1. Traer todos los datos filtrados por usuario, tienda y estado (si aplica)
        let query = supabase
          .from('gestion')
          .select('*')
          .or(`usuario.eq.${usuarioId},usuario.is.null`)
          .eq('tienda_fidelidad', miTienda);
        if (filtroEstado !== null && filtroEstado !== undefined) {
          query = query.eq('estado', filtroEstado);
        }
        const { data, error } = await query;
        if (error) throw error;
        const mapped = (data || []).map(row => ({
          ID: row.no_identificacion,
          NOMBRES: row.nombre,
          APELLIDOS: row.apellidos,
          TELEFONO: row.telefono,
          TIENDA: row.tienda_fidelidad,
          estado: row.estado || '',
          updated_at: row.updated_at,
          usuario: row.usuario,
          ...row
        }));
        setDatos(mapped);
        setTotal(mapped.length);

        // 2. Gestionados hoy: usuario=usuario, tienda=mi_tienda, updated_at=fecha de hoy (dd/mm/aaaa)
        const hoy = new Date();
        const dd = String(hoy.getDate()).padStart(2, '0');
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const yyyy = hoy.getFullYear();
        const fechaHoy = `${dd}/${mm}/${yyyy}`;
        const { count: gestionadosCount, error: errorGestionados } = await supabase
          .from('gestion')
          .select('id', { count: 'exact', head: true })
          .eq('usuario', usuarioId)
          .eq('tienda_fidelidad', miTienda)
          .eq('updated_at', fechaHoy);
        if (errorGestionados) throw errorGestionados;
        setGestionadosHoy(gestionadosCount || 0);

        // 3. Pendientes: total - gestionados hoy
        setPendientes(mapped.length - (gestionadosCount || 0));
      } catch (err) {
        setDatos([]);
        setTotal(0);
        setGestionadosHoy(0);
        setPendientes(0);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [usuarioId, miTienda, update, filtroEstado]);

  return { datos, loading, error, total, gestionadosHoy, pendientes };
}
