import React, { useState } from "react";
import styles from "./RegistrarPlanMobile.module.css";
export default function RegistrarPlanMobile({ open, onClose, onAddPlan }) {
  const [nombre, setNombre] = useState("");
  const [tasa, setTasa] = useState("");
  const [agregando, setAgregando] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAgregando(true);
    await onAddPlan(nombre, tasa, setNombre, setTasa);
    setAgregando(false);
  };

  return (
    <div className={styles.modalMobile}>
      <form className={styles.formContainer} onSubmit={handleSubmit}>
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




