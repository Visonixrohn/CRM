import React from "react";
import useNotificacionesSinTomar from "./useNotificacionesSinTomar";
import "./NotificacionesSinTomar.css";

const NotificacionesSinTomarHeader = ({ onClickClientes, onClickActualizaciones }) => {
  const { clientesNuevosSinTomar, actualizacionesSinTomar } = useNotificacionesSinTomar();

  if (clientesNuevosSinTomar === 0 && actualizacionesSinTomar === 0) return null;
  return (
    <div className="notificaciones-header">
      {clientesNuevosSinTomar > 0 && (
        <button
          className="notificacion-btn info"
          style={{ background: "#2563eb", color: "#fff" }}
          onClick={onClickClientes}
        >
          Clientes nuevos
          <span className="notificacion-badge">{clientesNuevosSinTomar}</span>
        </button>
      )}
      {actualizacionesSinTomar > 0 && (
        <button
          className="notificacion-btn warning"
          style={{ background: "#fbbf24", color: "#fff" }}
          onClick={onClickActualizaciones}
        >
          Actualizaciones
          <span className="notificacion-badge">{actualizacionesSinTomar}</span>
        </button>
      )}
    </div>
  );
};

export default NotificacionesSinTomarHeader;
