import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import "../ModalesNew.css";

const opcionesEstatus = [
  "Pendiente",
  "Entregado",
  "Rechazado",
  "Reprogramado"
];

const ActualizarEstatusModal = ({ open, entrega, onClose, onUpdated }) => {
  const [estatus, setEstatus] = useState(entrega?.estatus || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !entrega) return null;

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .update({ estatus })
        .eq("id", entrega.id);
      if (error) throw error;
      if (typeof onUpdated === "function") onUpdated(estatus);
      onClose();
    } catch (e) {
      setError(e.message || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container modal-small">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2 className="modal-title">🔄 Actualizar Estado de Entrega</h2>
        <div className="form-group">
          <label className="form-label">Selecciona el nuevo estado</label>
          <select 
            className="form-select"
            value={estatus} 
            onChange={e => setEstatus(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            <option value="Pendiente">⏳ Pendiente</option>
            <option value="Entregado">✅ Entregado</option>
            <option value="Rechazado">❌ Rechazado</option>
            <option value="Reprogramado">🔄 Reprogramado</option>
          </select>
        </div>
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={loading || !estatus}
          >
            {loading ? '⏳ Guardando...' : '✅ Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActualizarEstatusModal;
