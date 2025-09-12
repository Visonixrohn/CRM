import React from "react";
import "./HeaderMovil.css";

const HeaderMovil = ({ onMenu }) => {
  return (
    <div className="header-movil-fab-container-right">
      <button className="header-movil-fab-blue" aria-label="Abrir menú" onClick={onMenu}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>
    </div>
  );
};

export default HeaderMovil;
