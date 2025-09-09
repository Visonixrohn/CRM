import React from "react";
import "./OrdenesServicioFiltroMovil.css";

const OrdenesServicioFiltroMovil = ({ estados, filterState, setFilterState }) => (
  <div className="ordenes-servicio-filtro-movil">
    {estados.map((estado) => {
      const estadoClass = estado
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(
          /[áéíóú]/g,
          (m) => ({ á: "a", é: "e", í: "i", ó: "o", ú: "u" }[m])
        );
      return (
        <button
          key={estado}
          className={`filtro-movil-btn ${estadoClass} ${filterState === estado ? "active" : ""}`}
          onClick={() => setFilterState(filterState === estado ? "" : estado)}
        >
          {estado}
        </button>
      );
    })}
  </div>
);

export default OrdenesServicioFiltroMovil;
