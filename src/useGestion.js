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
          const formatted = rows.map((row) => {
            const obj = {};
            headers.forEach((header, idx) => {
              obj[header] = row[idx] || "";
            });
            return obj;
          });
          // Filtrar por usuario
          const filtrados = formatted.filter(row => row.USUARIO && row.USUARIO === usuarioId);
          setDatos(filtrados);
        } else {
          setDatos([]);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [usuarioId]);

  return { datos, loading, error };
}
