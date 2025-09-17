// Hook para obtener datos de gestión desde useGestion.js
import useGestion from "./useGestion";

export default function useGestionResumen(update) {
  const { total, gestionadosHoy, pendientes } = useGestion(update);
  return { total, gestionadosHoy, pendientes };
}
