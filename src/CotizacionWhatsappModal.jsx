import React, { useState, useEffect, useRef } from "react";
import styles from "./CotizacionWhatsappModal.module.css";
import useNombreUsuario from "./hooks/useNombreUsuario";

const tipos = ["Nuevo", "Establecido"];

const CotizacionWhatsappModal = ({ open, onClose, usuarioId, plazo, prima, cuota, productoDefault }) => {

  const [tipo, setTipo] = useState("Nuevo");
  const [cel, setCel] = useState("");
  const [producto, setProducto] = useState(productoDefault || "");
  const nombreUsuario = useNombreUsuario();

  // Sincronizar producto con productoDefault cada vez que cambie el modal o el prop
  useEffect(() => {
    if (open) {
      setProducto(productoDefault || "");
    }
  }, [productoDefault, open]);

  // Manejo de historial para botón atrás
  const firstRender = useRef(true);
  useEffect(() => {
    if (open) {
      if (!firstRender.current) {
        window.history.pushState({ modal: 'cotizacionWhatsapp' }, '');
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
  if (!cel || !producto) return alert("Completa todos los campos");

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
    `Hola te saluda ${nombre},%0A` +
    `tu cotización de ${producto}%0A` +
    `es la siguiente:%0A` +
    `plazo: ${plazo} meses%0A` +
    `prima: ${prima}%0A` +
    `cuota mensual: ${cuota} estimada%0A` +
    `total de: ${Number(cuota) * Number(plazo)}%0A%0A` +
    `Llena este link para avanzar con el ingreso de la solicitud:%0A` +
    encodeURIComponent(url); // ✅ aquí está la clave

  // Abrir WhatsApp según dispositivo
  const isMobileScreen = typeof window !== "undefined" && window.innerWidth < 900;
  if (isMobileScreen) {
    window.open(`https://wa.me/${cel}?text=${mensaje}`, "_blank");
  } else {
    window.open(`https://web.whatsapp.com/send?phone=${cel}&text=${mensaje}`, "_blank");
  }
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
