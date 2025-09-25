import React from "react";
import "./OrdenesServicioCardMovil.css";


const OrdenesServicioCard = ({ orden, onVerDetalle, ext }) => (
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
    {/* Datos externos */}
    <div className="analisis-card-value">
      Modelo: {ext === undefined ? 'Cargando...' : ext && ext.model ? ext.model : (ext === null ? 'Error' : '')}
    </div>
    <div className="analisis-card-value">
      Marca: {ext === undefined ? 'Cargando...' : ext && ext.brand ? ext.brand : (ext === null ? 'Error' : '')}
    </div>
    <div className="analisis-card-value">
      Status: {ext === undefined ? 'Cargando...' : ext && ext.status ? ext.status : (ext === null ? 'Error' : '')}
    </div>
    <div style={{display:'flex',gap:8,justifyContent:'center'}}>
      <button onClick={() => onVerDetalle && onVerDetalle(orden)}>
        Ver Detalle
      </button>
    </div>
  </div>
);

export default OrdenesServicioCard;
