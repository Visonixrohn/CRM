import React from "react";
import "./RazonesCard.css";

const RazonesCard = ({ razon }) => (
  <div className="razon-card-mobile">
    <div className="razon-card-header">{razon.codigo}</div>
   
    <div className="razon-card-info">Descripción: {razon.descripcion}</div>
  </div>
);

export default RazonesCard;
