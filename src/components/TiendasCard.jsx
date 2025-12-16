import React from "react";
import "./TiendasCard.css";

const TiendasCard = ({ tienda, onEditar }) => (
  <div className="tienda-card-mobile">
    <div className="tienda-card-top">
      <div className="tienda-card-number">{tienda.numero_tienda}</div>
      <div className="tienda-card-header">{tienda.nombre}</div>
    </div>
    <div className="tienda-card-actions">
      <button className="btn btn-outline small">Ver</button>
      <button className="btn btn-primary small" onClick={onEditar}>
        Editar
      </button>
    </div>
  </div>
);

export default TiendasCard;
