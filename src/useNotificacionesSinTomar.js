import useClientesNuevosSupabase from "./useClientesNuevosSupabase";
import useActualizaciones from "./useActualizaciones";

export default function useNotificacionesSinTomar() {
  const { clientes: clientesNuevos = [] } = useClientesNuevosSupabase();
  const { datos: actualizaciones = [] } = useActualizaciones();

  // Clientes nuevos sin tomar: STATUS distinto de "Tomado"
  const clientesNuevosSinTomar = clientesNuevos.filter(c => c.STATUS !== "Tomado").length;
  // Actualizaciones sin tomar: status null o vacío
  const actualizacionesSinTomar = actualizaciones.filter(a => !a.status || a.status === null).length;

  return {
    clientesNuevosSinTomar,
    actualizacionesSinTomar,
  };
}
