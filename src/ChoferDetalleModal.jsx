import React from "react";
import "./ChoferDetalleModal.css";

const ChoferDetalleModal = ({ open, chofer, onClose, onEdit }) => {
  if (!open || !chofer) return null;
  return (
    <div className="chofer-detalle-modal-bg">
      <div className="chofer-detalle-modal">
        <div className="chofer-detalle-titulo">Datos del Chofer</div>
        <div className="chofer-detalle-lista">
          <div className="chofer-detalle-item"><span className="chofer-detalle-label">Nombre:</span> <span className="chofer-detalle-valor">{chofer.nombre}</span></div>
          <div className="chofer-detalle-item"><span className="chofer-detalle-label">Teléfono:</span> <span className="chofer-detalle-valor">{chofer.telefono}</span></div>
        </div>
        <button className="chofer-detalle-cerrar" onClick={onClose}>Cerrar</button>
        <button className="chofer-detalle-editar" onClick={onEdit}>Editar</button>
      </div>
    </div>
  );
};

export default ChoferDetalleModal;
