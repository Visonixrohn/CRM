import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import "../ModalesNew.css";

const opcionesTipoEntrega = [
  "DOMICILIO",
  "TIENDA",
  "BODEGA TG",
  "	BODEGA SPS"
];

const ActualizarTipoEntregaModal = ({ open, entrega, onClose, onUpdated }) => {
  const [tipoEntrega, setTipoEntrega] = useState(entrega?.tipo_entrega || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !entrega) return null;

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .update({ tipo_entrega: tipoEntrega })
        .eq("id", entrega.id);
      if (error) throw error;
      if (typeof onUpdated === "function") onUpdated(tipoEntrega);
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
        <h2 className="modal-title">🚚 Actualizar Tipo de Entrega</h2>
        <div className="form-group">
          <label className="form-label">Selecciona el tipo de entrega</label>
          <select 
            className="form-select"
            value={tipoEntrega} 
            onChange={e => setTipoEntrega(e.target.value)}
          >
            <option value="">-- Seleccionar --</option>
            <option value="TIENDA">🏪 Tienda</option>
            <option value="DOMICILIO">🏠 Domicilio</option>
            <option value="BODEGA SPS">📦 Bodega San Pedro Sula</option>
            <option value="BODEGA TG">📦 Bodega Tegucigalpa</option>
          </select>
        </div>
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button 
            className="btn-primary" 
            onClick={handleSave} 
            disabled={loading || !tipoEntrega}
          >
            {loading ? '⏳ Guardando...' : '✅ Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActualizarTipoEntregaModal;
