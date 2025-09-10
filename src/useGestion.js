import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const SHEET_ID = "1DT9s9uYmVuLctxeBApAwU8HaNfwc6UQNzO2O437Qq5s";
const API_KEY = "AIzaSyCIUJIvnSyAxU4NEp2lotm-QodOKQ0FqFA";
const URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Hoja 1?key=${API_KEY}`;

export default function useGestion() {
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
  const [total, setTotal] = useState(0);
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUsuarioId(data.user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!usuarioId) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(URL);
        const data = await response.json();
        if (data.values) {
          const headers = data.values[0];
          const rows = data.values.slice(1);
          // Mapear headers a claves estándar según los nombres de la hoja
          const keyMap = {};
          headers.forEach((h, idx) => {
            const key = h.trim().toLowerCase();
            if (["no. identificacion", "no identificacion", "identificacion"].includes(key)) keyMap[idx] = "id";
            else if (["tienda fidelidad", "tienda"].includes(key)) keyMap[idx] = "tienda";
            else if (["cadena fidelidad", "cadena"].includes(key)) keyMap[idx] = "cadena";
            else if (["apellidos", "apellido"].includes(key)) keyMap[idx] = "apellido";
            else if (["nombre", "nombres"].includes(key)) keyMap[idx] = "nombre";
            else if (["departamento", "depto"].includes(key)) keyMap[idx] = "departamento";
            else if (["municipio"].includes(key)) keyMap[idx] = "municipio";
            else if (["telefono", "tel"].includes(key)) keyMap[idx] = "tel";
            else if (["segmento base", "segmento"].includes(key)) keyMap[idx] = "segmento";
            else if (["usuario"].includes(key)) keyMap[idx] = "usuario";
            else keyMap[idx] = h; // fallback
          });
          const formatted = rows.map((row) => {
            const obj = {};
            headers.forEach((header, idx) => {
              obj[keyMap[idx]] = row[idx] || "";
            });
            return obj;
          });
          // Filtrar por usuario (campo robusto)
          const filtrados = formatted.filter(row => (row.usuario || row.USUARIO) && (row.usuario || row.USUARIO) === usuarioId);
          setDatos(filtrados);
          setTotal(filtrados.length);
          // Pendientes: los que no tienen STATUS "Tomado"
          setPendientes(filtrados.filter(row => (row.status || row.STATUS) !== "Tomado").length);
        } else {
          setDatos([]);
          setTotal(0);
          setPendientes(0);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [usuarioId]);

  return { datos, loading, error, total, pendientes };
}
