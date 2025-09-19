import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const SHEET_ID = "1MmVZkubwhL4goX3wptmRZGvMFJtRBhJnb2TEwVwUNbk";
const API_KEY = "AIzaSyA-Jv8AMyTySXYsd8rY2kEdNhhotdNWolg";
const URL = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/SolicitudesCredito?key=${API_KEY}`;

export default function useClientesNuevos() {
  const [clientes, setClientes] = useState([]);
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
  // Mostrar todos los clientes sin filtrar por usuario
  // Filtrar por usuario
  const filtrados = formatted.filter(row => row.usuario && row.usuario === usuarioId);
  setClientes(filtrados);
      } else {
        setClientes([]);
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

  return { clientes, loading, error, refetch: fetchData };
}
