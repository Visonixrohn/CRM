import React from "react";
import "./OrdenesServicioCard.css";

const OrdenesServicioCard = ({ orden, onVerDetalle }) => (
  <div className="orden-servicio-card-mobile">
    <div className="orden-servicio-card-header">Orden #{orden.numero_orden}</div>
    <div className="orden-servicio-card-info">Cliente: {orden.cliente}</div>
    <div className="orden-servicio-card-info">Fecha: {orden.fecha}</div>
    <div className="orden-servicio-card-info">Estado: {orden.estado}</div>
    <button className="orden-servicio-card-btn" onClick={() => onVerDetalle && onVerDetalle(orden)}>
      Ver Detalle
    </button>
  </div>
);

export default OrdenesServicioCard;
