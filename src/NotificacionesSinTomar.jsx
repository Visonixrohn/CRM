import React from "react";
import useNotificacionesSinTomar from "./useNotificacionesSinTomar";
import "./NotificacionesSinTomar.css";

const NotificacionesSinTomar = ({ onClickClientes, onClickActualizaciones }) => {
  const { clientesNuevosSinTomar, actualizacionesSinTomar } = useNotificacionesSinTomar();

  return (
    <div className="notificaciones-header">
      <button
        className="notificacion-btn info"
        style={{ background: "#2563eb", color: "#fff" }}
        onClick={onClickClientes}
      >
        Clientes nuevos
        {clientesNuevosSinTomar > 0 && (
          <span className="notificacion-badge">{clientesNuevosSinTomar}</span>
        )}
      </button>
      <button
        className="notificacion-btn warning"
        style={{ background: "#fbbf24", color: "#fff" }}
        onClick={onClickActualizaciones}
      >
        Actualizaciones
        {actualizacionesSinTomar > 0 && (
          <span className="notificacion-badge">{actualizacionesSinTomar}</span>
        )}
      </button>
    </div>
  );
};

export default NotificacionesSinTomar;
