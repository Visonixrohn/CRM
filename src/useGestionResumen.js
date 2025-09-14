// Hook para obtener datos de gestión desde useGestion.js
import { useEffect, useState } from "react";
import useGestion from "./useGestion";

export default function useGestionResumen() {
  const { total, pendientes } = useGestion();
  const [gestionadosHoy, setGestionadosHoy] = useState(0);

  useEffect(() => {
    const hoy = new Date().toLocaleDateString();
    const gestionados = JSON.parse(localStorage.getItem("gestionados") || "[]");
    setGestionadosHoy(gestionados.filter((g) => g.fecha === hoy).length);
  }, []);

  return { total, gestionadosHoy, pendientes };
}
