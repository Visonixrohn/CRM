// Hook para obtener datos de gestión desde useGestion.js
import useGestion from "./useGestion";
import useGestionadosHoy from "./useGestionadosHoy";

export default function useGestionResumen(update) {
  const { total, pendientes } = useGestion(update);
  const gestionadosHoy = useGestionadosHoy(update);
  return { total, gestionadosHoy, pendientes };
}
