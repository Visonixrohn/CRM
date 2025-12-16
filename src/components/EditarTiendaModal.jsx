import React, { useState, useEffect } from "react";
import "./EditarTiendaModal.css";

const EditarTiendaModal = ({ tienda, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    numero_tienda: "",
    tienda: "",
    direccion: "",
    telefono: "",
    encargado: "",
  });

  useEffect(() => {
    if (tienda) {
      setFormData({
        numero_tienda: tienda.numero_tienda || "",
        tienda: tienda.tienda || "",
        direccion: tienda.direccion || "",
        telefono: tienda.telefono || "",
        encargado: tienda.encargado || "",
      });
    }
  }, [tienda]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(tienda.id, formData);
  };

  if (!tienda) return null;

  return (
    <div className="editar-tienda-overlay" onClick={onClose}>
      <div className="editar-tienda-modal" onClick={(e) => e.stopPropagation()}>
        <div className="editar-tienda-header">
          <div className="header-content">
            <div className="header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className="header-text">
              <h2>Editar Tienda</h2>
              <p className="header-subtitle">Actualiza la información de la tienda</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form className="editar-tienda-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label className="field-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="label-icon">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 9h6M9 13h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Número de Tienda
              </label>
              <input
                type="text"
                name="numero_tienda"
                className="field-input"
                value={formData.numero_tienda}
                onChange={handleChange}
                placeholder="Ej: 001"
                required
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="label-icon">
                  <path d="M20 7h-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Nombre de Tienda
              </label>
              <input
                type="text"
                name="tienda"
                className="field-input"
                value={formData.tienda}
                onChange={handleChange}
                placeholder="Nombre completo"
                required
              />
            </div>

            <div className="form-field full-width">
              <label className="field-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="label-icon">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                className="field-input"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Dirección completa de la tienda"
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="label-icon">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                className="field-input"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="0000-0000"
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="label-icon">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Encargado
              </label>
              <input
                type="text"
                name="encargado"
                className="field-input"
                value={formData.encargado}
                onChange={handleChange}
                placeholder="Nombre del encargado"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarTiendaModal;
