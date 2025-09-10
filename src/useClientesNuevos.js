import { useEffect, useState } from "react";
import Papa from "papaparse";
import { supabase } from "./supabaseClient";

export default function useClientesNuevos() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) setUsuarioId(data.user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!usuarioId) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFX5eKDodVmbXf_U0DJNl5MgXrzZgCCgGbswtez88Gu4ywvLMoRIsBAd33vZ1rDEidXTO4zfcv3zWE/pub?output=csv"
        );
        const csvData = await response.text();
        Papa.parse(csvData, {
          header: true,
          complete: (result) => {
            // Filtrar por usuario
            const filtrados = result.data.filter(
              (row) => row.usuario && row.usuario === usuarioId
            );
            setClientes(filtrados);
            setLoading(false);
          },
          error: (err) => {
            setError(err.message);
            setLoading(false);
          },
        });
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, [usuarioId]);

  return { clientes, loading, error };
}
