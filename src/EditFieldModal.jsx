import React from "react";
import "./EditFieldModal.css";

const EditFieldModal = ({
  open,
  field,
  value,
  onChange,
  onClose,
  onSave
}) => {
  if (!open) return null;
  const fieldLabel = field === 'cliente' ? 'Cliente' : field === 'factura' ? 'Factura' : field === 'cel' ? 'Teléfono' : 'Artículo';
  return (
    <div className="edit-field-modal-bg">
      <div className="edit-field-modal">
        <h3 className="edit-field-modal-title">Editar {fieldLabel}</h3>
        <input
          type="text"
          value={value}
          autoFocus
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') onSave(); }}
          className="edit-field-modal-input"
        />
        <div className="edit-field-modal-actions">
          <button className="edit-field-modal-cancel" onClick={onClose}>Cancelar</button>
          <button className="edit-field-modal-save" onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default EditFieldModal;
