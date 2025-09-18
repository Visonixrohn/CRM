import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function useTablaGestion(update) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      setError(null);
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) throw new Error("Usuario no logueado");
        // Obtener tienda del usuario
        const { data: perfil, error: errorPerfil } = await supabase
          .from("profiles")
          .select("mi_tienda")
          .eq("id", userId)
          .maybeSingle();
        if (errorPerfil) throw errorPerfil;
        const miTienda = perfil?.mi_tienda;
        if (!miTienda) throw new Error("No se encontró la tienda del usuario");
        // Traer clientes con estado vacío
        const { data, error: errorClientes } = await supabase
          .from("gestion")
          .select("*")
          .eq("tienda_fidelidad", miTienda)
          .or(`usuario.eq.${userId},usuario.is.null`)
          .or("estado.is.null,estado.eq.");
        if (errorClientes) throw errorClientes;
        // Mapear datos
        const filtrados = (data || []).map(row => ({
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
        setClientes(filtrados);
      } catch (err) {
        setClientes([]);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, [update]);

  return { clientes, loading, error };
}
