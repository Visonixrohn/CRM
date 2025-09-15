import React, { useState } from "react";
import "./ModalAgregarSeguimiento.css";

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

export default function ModalAgregarSeguimiento({ open, onClose, onSave, loading }) {
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
    const userId = localStorage.getItem("userId");
    await onSave({ ...form, id_usuario: userId });
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
    <div className="modal-agregar-seg-overlay">
      <form className="modal-agregar-seg" onSubmit={handleSubmit}>
        <h3>Agregar seguimiento</h3>
        {campos.map(c => (
          <div className="modal-agregar-seg-campo" key={c.name}>
            <label>{c.label}:</label>
            {c.type === "select" ? (
              <select
                name={c.name}
                value={form[c.name]}
                onChange={handleChange}
                required
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
                required
              />
            )}
          </div>
        ))}
        {error && <div className="modal-agregar-seg-error">{error}</div>}
        <div className="modal-agregar-seg-botones">
          <button type="button" onClick={onClose} className="cancelar">Cancelar</button>
          <button type="submit" className="guardar" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </div>
  );
}
