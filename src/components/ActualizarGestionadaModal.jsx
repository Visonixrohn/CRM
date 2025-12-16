import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import "../ModalesNew.css";

const opcionesGestionada = [
  "Gestionada",
  "No gestionada"
];

const ActualizarGestionadaModal = ({ open, entrega, onClose, onUpdated }) => {
  const [gestionada, setGestionada] = useState(entrega?.gestionada || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !entrega) return null;

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .update({ gestionada })
        .eq("id", entrega.id);
      if (error) throw error;
      if (typeof onUpdated === "function") onUpdated(gestionada);
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
        <h2 className="modal-title">📋 Actualizar Estado de Gestión</h2>
        <div className="form-group">
          <label className="form-label">Selecciona el estado de gestión</label>
          <select 
            className="form-select"
            value={gestionada} 
            onChange={e => setGestionada(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            <option value="NO GESTIONADA">⏳ No gestionada</option>
            <option value="GESTIONADA">✅ Gestionada</option>
          </select>
        </div>
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={loading || !gestionada}
          >
            {loading ? '⏳ Guardando...' : '✅ Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActualizarGestionadaModal;
