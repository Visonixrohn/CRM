import React, { useState, useEffect, useRef } from "react";
import styles from "./ModalForm.module.css";

export default function ModalForm({ open, onClose, onAddPlan }) {
  const [nombre, setNombre] = useState("");
  const [tasa, setTasa] = useState("");
  const [agregando, setAgregando] = useState(false);

  // Manejo de historial para botón atrás
  const firstRender = useRef(true);
  useEffect(() => {
    if (open) {
      if (!firstRender.current) {
        window.history.pushState({ modal: 'modalForm' }, '');
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
    await onAddPlan(nombre, tasa, setNombre, setTasa);
    setAgregando(false);
  };

  // Cerrar modal al hacer click fuera del formulario
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.modalDesktop} onClick={handleBackdropClick}>
      <form className={styles.formContainer} onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
        <button type="button" className={styles.cerrar} onClick={onClose} aria-label="Cerrar">×</button>
        <div className={styles.titulo}>Agregar Plan</div>
        <input
          className={styles.input}
          type="text"
          placeholder="Nombre del plan"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
        <input
          className={styles.input}
          type="number"
          step="0.01"
          min="0"
          placeholder="Tasa (%)"
          value={tasa}
          onChange={e => setTasa(e.target.value)}
          required
        />
        <button className={styles.boton} type="submit" disabled={agregando}>
          {agregando ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  );
}
