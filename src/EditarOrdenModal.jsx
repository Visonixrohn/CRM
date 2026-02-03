import React, { useState } from "react";
import "./ModalesNew.css";

const EditarOrdenModal = ({ isOpen, onClose, orden, onSave }) => {
  const [form, setForm] = useState({ ...orden });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-agregar" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        
        <h2 className="modal-title">✏️ Editar Orden de Servicio</h2>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid-two">
            <div className="form-group-modern">
              <label className="form-label-modern">
                <span className="label-icon">📅</span>
                Fecha
              </label>
              <input
                type="date"
                name="fecha"
                className="form-input-modern"
                value={form.fecha || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">
                <span className="label-icon">👤</span>
                Cliente
              </label>
              <input
                type="text"
                name="cliente"
                className="form-input-modern"
                placeholder="Nombre del cliente"
                value={form.cliente || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-grid-two">
            <div className="form-group-modern">
              <label className="form-label-modern">
                <span className="label-icon">📞</span>
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                className="form-input-modern"
                placeholder="0000-0000"
                value={form.telefono || ""}
                onChange={handleChange}
                pattern="[0-9+\-]*"
                title="Solo números y signos (+, -)"
                required
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">
                <span className="label-icon">🔢</span>
                Número de Orden
              </label>
              <input
                type="text"
                name="numero_orden"
                className="form-input-modern"
                placeholder="Número de orden"
                value={form.numero_orden || ""}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group-modern">
            <label className="form-label-modern">
              <span className="label-icon">📊</span>
              Estado
            </label>
            <select
              name="estado"
              className="form-input-modern"
              value={form.estado || "PENDIENTE DE VISITA"}
              onChange={handleChange}
            >
              <option value="PENDIENTE DE VISITA">PENDIENTE DE VISITA</option>
              <option value="PENDIENTE DE REPUESTO">PENDIENTE DE REPUESTO</option>
              <option value="REPARADO">REPARADO</option>
              <option value="SUGERENCIA DE CAMBIO">SUGERENCIA DE CAMBIO</option>
              <option value="FINALIZADO">FINALIZADO</option>
              <option value="ANULADA">ANULADA</option>
            </select>
          </div>

          <div className="form-group-modern">
            <label className="form-label-modern">
              <span className="label-icon">📎</span>
              URL del archivo (opcional)
            </label>
            <input
              type="text"
              name="archivo"
              className="form-input-modern"
              placeholder="https://..."
              value={form.archivo || ""}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions-modern">
            <button type="button" className="btn-modal-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-modal-confirm">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{marginRight: '6px'}}>
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarOrdenModal;
