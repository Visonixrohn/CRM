import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const SHEET_ID = "1MmVZkubwhL4goX3wptmRZGvMFJtRBhJnb2TEwVwUNbk";
const API_KEY = "AIzaSyCIUJIvnSyAxU4NEp2lotm-QodOKQ0FqFA";
const URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/ACT?key=${API_KEY}`;

export default function useActualizaciones() {
  const [datos, setDatos] = useState([]);
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
        // Filtrar por usuario (acepta USUARIO o usuario)
        const filtrados = formatted.filter(row => (row.USUARIO && row.USUARIO === usuarioId) || (row.usuario && row.usuario === usuarioId));
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

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [usuarioId]);

  return { datos, loading, error, refetch: fetchData };
}
