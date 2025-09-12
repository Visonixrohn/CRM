import React, { useState, useEffect, useRef } from "react";
import useNombreUsuario from "./hooks/useNombreUsuario";
import styles from "./GestionLinkModal.module.css";

const tipos = ["Nuevo", "Establecido"];

const GestionLinkModalMobile = ({ open, onClose, usuarioId, telefono }) => {
  const [tipo, setTipo] = useState("Nuevo");
  const nombreUsuario = useNombreUsuario();
  // Manejo de historial para botón atrás
  const firstRender = useRef(true);
  useEffect(() => {
    if (open) {
      if (!firstRender.current) {
        window.history.pushState({ modal: 'gestionLinkMobile' }, '');
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

  const handleEnviar = () => {
  if (!telefono) return alert("No hay teléfono disponible");

  let nombre = nombreUsuario;
  if (!nombre) {
    nombre = prompt("¿Cuál es tu nombre completo?");
    if (!nombre) return alert("Debes ingresar tu nombre para continuar.");
    localStorage.setItem("nombre", nombre);
  }

  // Construir la URL con todos los parámetros
  const baseUrl = tipo === "Nuevo"
    ? "https://crtroatan568-lab.github.io/SOLICITUD/"
    : "https://crtroatan568-lab.github.io/Actualizacion/";

  const url = `${baseUrl}?usuario=${encodeURIComponent(usuarioId)}&name=${encodeURIComponent(nombre)}`;

  // Codificar toda la URL para WhatsApp
  const mensaje =
    `Hola, gracias por contestar mi llamada. Para avanzar con la solicitud, por favor ayúdame llenando este formulario:%0A` +
    encodeURIComponent(url); // ✅ codificamos la URL completa

  // Abrir WhatsApp
  window.open(`https://wa.me/504${telefono}?text=${mensaje}`, "_blank");
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

export default GestionLinkModalMobile;
