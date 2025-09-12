import React, { useEffect, useRef } from "react";
import "./ChoferDetalleModal.css";

const ChoferDetalleModal = ({ open, chofer, onClose, onEdit }) => {
  // Manejo de historial para botón atrás
  const firstRender = useRef(true);
  useEffect(() => {
    if (open) {
      if (!firstRender.current) {
        window.history.pushState({ modal: 'choferDetalle' }, '');
      }
      const handlePop = (e) => {
        if (open) {
          onClose();
        }
      };
      window.addEventListener('popstate', handlePop);
      return () => {
        window.removeEventListener('popstate', handlePop);
        if (!firstRender.current && open) {
          window.history.back();
        }
      };
    }
    firstRender.current = false;
  }, [open]);
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
