import React from "react";
import "./ModalExito.css";

const ModalExito = ({ mensaje = "Actualización exitosa", onClose }) => {
  return (
    <div className="modal-exito-overlay" onClick={onClose}>
      <div className="modal-exito-contenido" onClick={e => e.stopPropagation()}>
        <h3>{mensaje}</h3>
        <button className="modal-exito-cerrar" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ModalExito;
