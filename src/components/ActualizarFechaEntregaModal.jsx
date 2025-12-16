import React, { useState } from "react";
import "../ModalesNew.css";

export default function ActualizarFechaEntregaModal({ open, entrega, onClose, onUpdated }) {
  const [pregunta, setPregunta] = useState(true);
  const [nuevaFecha, setNuevaFecha] = useState(entrega?.fecha_entrega || "");
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const handleActualizar = async () => {
    setLoading(true);
    // Aquí deberías llamar a la función de actualización real (API o prop)
    if (onUpdated) await onUpdated(nuevaFecha);
    setLoading(false);
    setPregunta(true);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container modal-small">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        {pregunta ? (
          <>
            <h2 className="modal-title">📅 Actualizar Fecha de Entrega</h2>
            <p className="modal-text">¿Deseas cambiar la fecha de entrega para este pedido?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose}>No, cancelar</button>
              <button className="btn-primary" onClick={()=>setPregunta(false)}>Sí, continuar</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="modal-title">📅 Nueva Fecha de Entrega</h2>
            <div className="form-group">
              <label className="form-label">Selecciona la nueva fecha</label>
              <input 
                type="date" 
                className="form-input"
                value={nuevaFecha} 
                onChange={e=>setNuevaFecha(e.target.value)} 
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose}>Cancelar</button>
              <button 
                className="btn-primary" 
                onClick={handleActualizar} 
                disabled={loading || !nuevaFecha}
              >
                {loading ? '⏳ Actualizando...' : '✅ Actualizar fecha'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
