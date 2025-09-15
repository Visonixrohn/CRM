import React, { useState } from "react";
import "./ModalAgregarSeguimientoMobile.css";

const campos = [
  { name: "nombre_cliente", label: "Nombre del cliente", type: "text" },
  { name: "dni", label: "DNI", type: "text" },
  { name: "cel", label: "Celular", type: "text" },
  { name: "articulo", label: "Artículo", type: "text" },
  { name: "tipo", label: "Tipo", type: "select", options: [
    { value: "CONTADO", label: "CONTADO" },
    { value: "CREDITO", label: "CREDITO" }
  ] },
  { name: "fecha_de_acuerdo", label: "Fecha de acuerdo", type: "date" },
];

export default function ModalAgregarSeguimientoMobile({ open, onClose, onSave, loading }) {
  const [form, setForm] = useState({
    nombre_cliente: "",
    dni: "",
    cel: "",
    articulo: "",
    tipo: "",
    fecha_de_acuerdo: "",
    estado: "Gestionado"
  });
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (!form.nombre_cliente || !form.dni || !form.cel || !form.articulo || !form.tipo || !form.fecha_de_acuerdo) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    await onSave(form);
    setForm({
      nombre_cliente: "",
      dni: "",
      cel: "",
      articulo: "",
      tipo: "",
      fecha_de_acuerdo: "",
      estado: "Gestionado"
    });
  };

  if (!open) return null;
  return (
    <div className="modal-agregar-seg-overlay-mobile">
      <form className="modal-agregar-seg-mobile" onSubmit={handleSubmit}>
        <h3>Agregar seguimiento</h3>
        {campos.map(c => (
          <div className="modal-agregar-seg-campo-mobile" key={c.name}>
            <label>{c.label}:</label>
            {c.type === "select" ? (
              <select
                name={c.name}
                value={form[c.name]}
                onChange={handleChange}
              >
                <option value="">Selecciona...</option>
                {c.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={c.type}
                name={c.name}
                value={form[c.name]}
                onChange={handleChange}
                autoComplete="off"
              />
            )}
          </div>
        ))}
        {error && <div className="modal-agregar-seg-error-mobile">{error}</div>}
        <button type="submit" disabled={loading} className="modal-agregar-seg-btn-mobile">
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" onClick={onClose} className="modal-agregar-seg-btn-cancel-mobile">Cancelar</button>
      </form>
    </div>
  );
}
