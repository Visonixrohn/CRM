import React, { useState } from "react";
import styles from "./GestionLinkModal.module.css";

const tipos = ["Nuevo", "Establecido"];

const GestionLinkModal = ({ open, onClose, usuarioId, telefono }) => {
  const [tipo, setTipo] = useState("Nuevo");

  if (!open) return null;

  const handleEnviar = () => {
    if (!telefono) return alert("No hay teléfono disponible");
    const url = tipo === "Nuevo"
      ? `https://crtroatan568-lab.github.io/SOLICITUD/?usuario=${usuarioId}`
      : `https://crtroatan568-lab.github.io/Actualizacion/?usuario=${usuarioId}`;
    const mensaje =
      `Hola Gracias por contestar mi llamada para avanzar con la solicitu ayudame llenando este formulario para  avanzar con el ingreso de la solicitud:%0A${url}`;
  window.open(`https://web.whatsapp.com/send/?phone=${telefono}&text=${mensaje}`, "_blank");
  };

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      style={{background: "transparent"}}
    >
      <div
        className={styles.modal}
        onClick={e => e.stopPropagation()}
      >
        <button className={styles.cerrar} onClick={onClose}>×</button>
        <h2>Enviar link por WhatsApp</h2>
        <div className={styles.tiposBtns}>
          {tipos.map(t => (
            <button
              key={t}
              className={tipo === t ? styles.tipoActivo : styles.tipoBtn}
              onClick={() => setTipo(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>
        <button className={styles.enviarBtn} onClick={handleEnviar}>
          Enviar info por WhatsApp
        </button>
      </div>
    </div>
  );
};

export default GestionLinkModal;
