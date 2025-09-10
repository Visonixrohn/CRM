import React, { useState } from "react";
import styles from "./CotizacionWhatsappModal.module.css";

const tipos = ["Nuevo", "Establecido"];

const CotizacionWhatsappModal = ({ open, onClose, usuarioId, plazo, prima, cuota, productoDefault }) => {
  const [tipo, setTipo] = useState("Nuevo");
  const [cel, setCel] = useState("");
  const [producto, setProducto] = useState(productoDefault || "");

  if (!open) return null;

  const handleEnviar = () => {
    if (!cel || !producto) return alert("Completa todos los campos");
    const url = tipo === "Nuevo"
      ? `https://crtroatan568-lab.github.io/SOLICITUD/?usuario=${usuarioId}`
      : `https://crtroatan568-lab.github.io/Actualizacion/?usuario=${usuarioId}`;
    const mensaje =
      `Hola%0A` +
      `tu cotizacion de ${producto}%0A` +
      `es la siguiente:%0A` +
      `plazo: ${plazo} meses%0A` +
      `prima: ${prima}%0A` +
      `cuota mensual: ${cuota} estimada%0A` +
      `total de : ${Number(cuota) * Number(plazo)}%0A%0A` +
      `llena este link para  avanzar con el ingreso de la solicitud:%0A${url}`;
    window.open(`https://wa.me/${cel}?text=${mensaje}`, "_blank");
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.cerrar} onClick={onClose}>×</button>
        <h2>Enviar cotización por WhatsApp</h2>
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
        <input
          type="tel"
          placeholder="Celular"
          value={cel}
          onChange={e => setCel(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Producto"
          value={producto}
          onChange={e => setProducto(e.target.value)}
          className={styles.input}
        />
        <button className={styles.enviarBtn} onClick={handleEnviar}>
          Enviar info por WhatsApp
        </button>
      </div>
    </div>
  );
};

export default CotizacionWhatsappModal;
