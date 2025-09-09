import React from "react";
import "./TiendasCard.css";

const TiendasCard = ({ tienda }) => (
  <div className="tienda-card-mobile">
    <div className="tienda-card-header">{tienda.nombre}</div>
    <div className="tienda-card-info">Número de tienda: {tienda.numero_tienda}</div>
    <div className="tienda-card-info">Código: {tienda.codigo}</div>
    <div className="tienda-card-info">Descripción: {tienda.descripcion}</div>
  </div>
);

export default TiendasCard;
