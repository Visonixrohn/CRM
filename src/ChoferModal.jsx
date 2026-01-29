import React, { useState, useEffect } from "react";
import "./ChoferModal.css";

const ChoferModal = ({ open, onClose, onSave, chofer }) => {
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ nombre: "", contacto: "" });
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (chofer) {
      setNombre(chofer.nombre || "");
      setContacto(chofer.telefono || chofer.contacto || "");
    } else {
      setNombre("");
      setContacto("");
    }
    setErrors({ nombre: "", contacto: "" });
  }, [chofer, open]);

  if (!open) return null;

  const validateForm = () => {
    const newErrors = { nombre: "", contacto: "" };
    let isValid = true;

    if (!nombre.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
      isValid = false;
    } else if (nombre.trim().length < 3) {
      newErrors.nombre = "El nombre debe tener al menos 3 caracteres";
      isValid = false;
    }

    if (!contacto.trim()) {
      newErrors.contacto = "El contacto es obligatorio";
      isValid = false;
    } else if (!/^[0-9]{8}$/.test(contacto.replace(/[^0-9]/g, ''))) {
      newErrors.contacto = "Ingrese un número válido (8 dígitos)";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave({ nombre: nombre.trim(), contacto: contacto.trim() });
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        setNombre("");
        setContacto("");
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error al guardar chofer:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNombre("");
    setContacto("");
    setErrors({ nombre: "", contacto: "" });
    onClose();
  };

  return (
    <>
      <div className="chofer-modal-overlay" onClick={handleClose}>
        <div className="chofer-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="chofer-modal-close" onClick={handleClose} disabled={loading}>
            ×
          </button>

          <div className="chofer-modal-header">
            <div className="chofer-modal-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
              </svg>
            </div>
            <h2 className="chofer-modal-title">
              {chofer ? '✏️ Editar Chofer' : '👤 Registrar Chofer'}
            </h2>
            <p className="chofer-modal-subtitle">
              {chofer ? 'Actualiza los datos del chofer' : 'Ingresa los datos del chofer para las entregas'}
            </p>
          </div>

          <div className="chofer-modal-body">
            <div className="chofer-form-group">
              <label className="chofer-form-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Nombre del Chofer *
              </label>
              <input
                type="text"
                className={`chofer-form-input ${errors.nombre ? 'error' : ''}`}
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (errors.nombre) setErrors({ ...errors, nombre: "" });
                }}
                placeholder="Ej: Juan Pérez"
                disabled={loading}
                maxLength={50}
              />
              {errors.nombre && <span className="chofer-form-error">{errors.nombre}</span>}
            </div>

            <div className="chofer-form-group">
              <label className="chofer-form-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Teléfono / WhatsApp *
              </label>
              <div className="chofer-phone-input-wrapper">
                <span className="chofer-phone-prefix">+504</span>
                <input
                  type="tel"
                  className={`chofer-form-input chofer-phone-input ${errors.contacto ? 'error' : ''}`}
                  value={contacto}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setContacto(value);
                    if (errors.contacto) setErrors({ ...errors, contacto: "" });
                  }}
                  placeholder="98765432"
                  disabled={loading}
                  maxLength={8}
                />
              </div>
              {errors.contacto && <span className="chofer-form-error">{errors.contacto}</span>}
              <span className="chofer-form-hint">Este número se usará para enviar entregas por WhatsApp</span>
            </div>
          </div>

          <div className="chofer-modal-footer">
            <button 
              className="chofer-btn chofer-btn-secondary" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              className="chofer-btn chofer-btn-primary" 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="chofer-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  {chofer ? 'Actualizar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <div className="chofer-confirmation-overlay">
          <div className="chofer-confirmation-card">
            <div className="chofer-confirmation-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3>¡Éxito!</h3>
            <p>Los datos del chofer se han guardado correctamente</p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChoferModal;
