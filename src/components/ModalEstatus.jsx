import React, { useState } from "react";
import "./ModalEstatus.css";

const estados = ["Pendiente", "Entregado", "Rechazado", "Reprogramado"];
const tipos = ["TIENDA", "BODEGA SPS", "BODEGA TG", "DOMICILIO"];
const gestionadas = ["GESTIONADA", "NO GESTIONADA"];

const ModalEstatus = ({ open, onClose, onSave, entrega }) => {
  const [estatus, setEstatus] = useState(entrega?.estatus || "Pendiente");
  const [tipo, setTipo] = useState(entrega?.tipo_entrega || "TIENDA");
  const [gestionada, setGestionada] = useState(entrega?.gestionada || "NO GESTIONADA");

  if (!open) return null;

  return (
    <div className="modal-estatus-bg">
      <div className="modal-estatus">
        <h3>Actualizar estatus</h3>
        <label>
          Estatus:
          <select value={estatus} onChange={e => setEstatus(e.target.value)}>
            {estados.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label>
          Tipo de entrega:
          <select value={tipo} onChange={e => setTipo(e.target.value)}>
            {tipos.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label>
          Gestionada:
          <select value={gestionada} onChange={e => setGestionada(e.target.value)}>
            {gestionadas.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <div className="modal-estatus-actions">
          <button onClick={onClose}>Cancelar</button>
          <button onClick={() => onSave(estatus, tipo, gestionada)}>Guardar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalEstatus;
