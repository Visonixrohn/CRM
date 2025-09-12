import React from "react";
import "./OrdenesServicioCard.css";

const getEstadoClass = (estado) => {
  if (!estado) return "estado-neutral";
  const e = estado.toLowerCase();
  if (e.includes("pendiente")) return "estado-pendiente";
  if (e.includes("proceso")) return "estado-proceso";
  if (e.includes("complet")) return "estado-completado";
  if (e.includes("cancel")) return "estado-cancelado";
  if (e.includes("entregado")) return "estado-entregado";
  return "estado-neutral";
};

const OrdenesServicioCard = ({ orden, onVerDetalle }) => (
  <div className="orden-servicio-card-mobile">
    <div className="orden-servicio-card-header">Orden #{orden.numero_orden}</div>
    <div className="orden-servicio-card-info">Cliente: {orden.cliente}</div>
    <div className="orden-servicio-card-info">Fecha: {orden.fecha}</div>
    <div className={`orden-servicio-card-info estado-card ${getEstadoClass(orden.estado)}`}>
      Estado: {orden.estado}
    </div>
    <button className="orden-servicio-card-btn" onClick={() => onVerDetalle && onVerDetalle(orden)}>
      Ver Detalle
    </button>
  </div>
);

export default OrdenesServicioCard;
