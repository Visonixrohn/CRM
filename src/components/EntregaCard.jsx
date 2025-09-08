import React from "react";
import "./EntregaCard.css";

const EntregaCard = ({ entrega, onEdit, onDelete }) => {
  return (
    <div className="entrega-card">
      <div className="entrega-card-row">
        <span className="entrega-card-label">Cliente:</span>
        <span className="entrega-card-value">{entrega.cliente}</span>
      </div>
      <div className="entrega-card-row">
        <span className="entrega-card-label">Factura:</span>
        <span className="entrega-card-value">{entrega.factura}</span>
      </div>
      <div className="entrega-card-row">
        <span className="entrega-card-label">Cel:</span>
        <span className="entrega-card-value">{entrega.cel}</span>
      </div>
      {entrega.ubicacion && (
        <div className="entrega-card-row">
          <span className="entrega-card-label">Ubicación:</span>
          <a
            className="entrega-card-value"
            href={entrega.ubicacion}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'underline', wordBreak: 'break-all' }}
          >
            Ver en Google Maps
          </a>
        </div>
      )}
     
      <div className="entrega-card-row">
        <span className="entrega-card-label">Tipo Entrega:</span>
        <span className="entrega-card-badge tipo">{entrega.tipo_entrega}</span>
      </div>
      <div className="entrega-card-row">
        <span className="entrega-card-label">Gestionada:</span>
        <span className="entrega-card-badge gestionada">{entrega.gestionada}</span>
      </div>
      <div className="entrega-card-row">
        <span className="entrega-card-label">Estado:</span>
        <span className={`entrega-card-badge status status-${entrega.estatus}`}>{entrega.estatus}</span>
      </div>
      <div className="entrega-card-actions">
        <button className="entrega-card-btn edit" onClick={() => onEdit(entrega)}>
          ✏️
        </button>
       
      </div>
    </div>
  );
};

export default EntregaCard;
