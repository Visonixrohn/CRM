import { useEffect, useState } from "react";
import useGestion from "./useGestion";

export default function useGestionadosHoy(update) {
  const { datos } = useGestion(update);
  const [gestionadosHoy, setGestionadosHoy] = useState(0);

  useEffect(() => {
    const hoy = new Date().toISOString().slice(0, 10);
    setGestionadosHoy(
      datos.filter(
        (c) => c.estado && c.updated_at && c.updated_at.slice(0, 10) === hoy
      ).length
    );
  }, [datos]);

  return gestionadosHoy;
}