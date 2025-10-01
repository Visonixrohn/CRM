import React, { useState } from "react";

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
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Editar Orden de Servicio</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="date"
            name="fecha"
            value={form.fecha || ""}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="cliente"
            placeholder="Cliente"
            value={form.cliente || ""}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono || ""}
            onChange={handleChange}
            pattern="[0-9+\-]*"
            title="Solo números y signos (+, -)"
            required
          />
          <input
            type="text"
            name="numero_orden"
            placeholder="Número de Orden"
            value={form.numero_orden || ""}
            onChange={handleChange}
            required
          />
          <select
            name="estado"
            value={form.estado || "PENDIENTE DE VISITA"}
            onChange={handleChange}
          >
            <option value="PENDIENTE DE VISITA">PENDIENTE DE VISITA</option>
            <option value="PENDIENTE DE REPUESTO">PENDIENTE DE REPUESTO</option>
            <option value="REPARADO">REPARADO</option>
            <option value="SUGERENCIA DE CAMBIO">SUGERENCIA DE CAMBIO</option>
            <option value="ANULADA">ANULADA</option>
          </select>
          <input
            type="text"
            name="archivo"
            placeholder="URL del archivo (opcional)"
            value={form.archivo || ""}
            onChange={handleChange}
          />
          <div className="form-actions">
            <button type="submit">Guardar cambios</button>
            <button type="button" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarOrdenModal;
