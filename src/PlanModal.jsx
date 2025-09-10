
import React, { useState } from "react";
import { createPortal } from "react-dom";
import modalFormStyles from "./ModalForm.module.css";

export default function PlanModal({ open, onClose, onAddPlan }) {
  const [nuevoPlan, setNuevoPlan] = useState("");
  const [nuevaTasa, setNuevaTasa] = useState("");
  const [agregando, setAgregando] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAgregando(true);
    await onAddPlan(nuevoPlan, nuevaTasa, setNuevoPlan, setNuevaTasa);
    setAgregando(false);
  };

  return createPortal(
    <div className={modalFormStyles.modalBg} onClick={onClose}>
      <div className={modalFormStyles.modal} onClick={e => e.stopPropagation()}>
        <button className={modalFormStyles.close} onClick={onClose} title="Cerrar">×</button>
        <h3 style={{marginTop:0}}>Registrar nuevo plan</h3>
        <form onSubmit={handleSubmit} className={modalFormStyles.modalForm}>
          <label>
            Nombre del plan
            <input
              type="text"
              placeholder="Nombre del plan"
              value={nuevoPlan}
              onChange={e => setNuevoPlan(e.target.value)}
              required
            />
          </label>
          <label>
            Tasa mensual (%)
            <input
              type="number"
              placeholder="Tasa mensual (%)"
              value={nuevaTasa}
              onChange={e => setNuevaTasa(e.target.value)}
              min={0.01}
              step={0.01}
              required
            />
          </label>
          <button className={modalFormStyles.addBtn} type="submit" disabled={agregando}>{agregando ? "Agregando..." : "Registrar plan"}</button>
        </form>
      </div>
    </div>,
    document.body
  );
}
