import React, { useState, useEffect, useRef } from "react";
import styles from "./ModalFormMobile.module.css";

export default function ModalFormMobile({ open, onClose, onAddPlan }) {
  const [nuevoPlan, setNuevoPlan] = useState("");
  const [nuevaTasa, setNuevaTasa] = useState("");
  const [agregando, setAgregando] = useState(false);

  // Manejo de historial para botón atrás
  const firstRender = useRef(true);
  useEffect(() => {
    if (open) {
      if (!firstRender.current) {
        window.history.pushState({ modal: 'modalFormMobile' }, '');
      }
      const handlePop = (e) => {
        if (open) onClose();
      };
      window.addEventListener('popstate', handlePop);
      return () => {
        window.removeEventListener('popstate', handlePop);
        if (!firstRender.current && open) {
          window.history.back();
        }
      };
    }
    firstRender.current = false;
  }, [open]);
  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAgregando(true);
    await onAddPlan(nuevoPlan, nuevaTasa, setNuevoPlan, setNuevaTasa);
    setAgregando(false);
  };

  return (
    <div className={styles.modalBg} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} title="Cerrar">×</button>
        <h3 className={styles.title}>Registrar nuevo plan</h3>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
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
          <button className={styles.addBtn} type="submit" disabled={agregando}>{agregando ? "Agregando..." : "Registrar plan"}</button>
        </form>
      </div>
    </div>
  );
}
