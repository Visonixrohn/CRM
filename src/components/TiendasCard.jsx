import React from "react";
import "./TiendasCard.css";

const TiendasCard = ({ tienda }) => (
  <div className="tienda-card-mobile">
    <div className="tienda-card-header">{tienda.nombre}</div>
 
   
  </div>
);

export default TiendasCard;
