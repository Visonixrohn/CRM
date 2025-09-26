import React from "react";
import "./OrdenesServicioCardMovil.css";



const OrdenesServicioCard = ({ orden, onVerDetalle, ext, onConsultarCorOne, loadingCorOne }) => {
  const estadosPermitidos = ["PENDIENTE DE VISITA", "PENDIENTE DE REPUESTO"];
  const mostrarResuelto = !estadosPermitidos.includes(orden.estado);
  return (
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
        Modelo: {mostrarResuelto ? 'RESUELTO' : loadingCorOne ? 'Cargando...' : ext === undefined ? '' : ext && ext.model ? ext.model : (ext === null ? 'Error' : '')}
      </div>
      <div className="analisis-card-value">
        Marca: {mostrarResuelto ? 'RESUELTO' : loadingCorOne ? 'Cargando...' : ext === undefined ? '' : ext && ext.brand ? ext.brand : (ext === null ? 'Error' : '')}
      </div>
      <div className="analisis-card-value">
        Falla: {mostrarResuelto ? 'RESUELTO' : loadingCorOne ? 'Cargando...' : ext === undefined ? '' : ext && ext.damage ? ext.damage : (ext === null ? 'Error' : '')}
      </div>
      <div className="analisis-card-value">
        Status: {mostrarResuelto ? 'RESUELTO' : loadingCorOne ? 'Cargando...' : ext === undefined ? '' : ext && ext.status ? ext.status : (ext === null ? 'Error' : '')}
      </div>
      <div style={{display:'flex',gap:8,justifyContent:'center'}}>
        <button onClick={() => onVerDetalle && onVerDetalle(orden)}>
          Ver Detalle
        </button>
        <button
          onClick={onConsultarCorOne}
          title="Consultar modelo, marca y status"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          {/* Icono lupa */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="11" cy="11" r="7" stroke="#6366f1" strokeWidth="2" fill="#fff"/>
            <line x1="16" y1="16" x2="21" y2="21" stroke="#6366f1" strokeWidth="2"/>
          </svg>
          {loadingCorOne && <span style={{marginLeft:4, fontSize:10}}>...</span>}
        </button>
      </div>
    </div>
  );
};

export default OrdenesServicioCard;
