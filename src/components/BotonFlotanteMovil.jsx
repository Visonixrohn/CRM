import React from "react";
import "./BotonFlotanteMovil.css";

const BotonFlotanteMovil = ({ onClick, icon = "+", label }) => (
  <button className="boton-flotante-movil" onClick={onClick} aria-label={label || "Agregar"}>
    {icon}
  </button>
);

export default BotonFlotanteMovil;
