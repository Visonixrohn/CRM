import React from "react";
import "./OrdenesServicioCardMovil.css";

const OrdenesServicioCard = ({ orden, onVerDetalle }) => (
  <div className="orden-servicio-card-movil-analisis solo-movil">
    <div className="analisis-card-title">
      Orden #{orden.numero_orden}
    </div>
    <div className="analisis-card-value">
      Cliente: {orden.cliente}
    </div>
    <div className="analisis-card-value">
      Fecha: {orden.fecha}
    </div>
    <div className="analisis-card-value">
      Estado: {orden.estado}
    </div>
    <div className="analisis-card-value">
      Gestor: {orden.gestor}
    </div>
    <div style={{display:'flex',gap:8,justifyContent:'center'}}>
      <button onClick={() => onVerDetalle && onVerDetalle(orden)}>
        Ver Detalle
      </button>
    </div>
  </div>
);

export default OrdenesServicioCard;
