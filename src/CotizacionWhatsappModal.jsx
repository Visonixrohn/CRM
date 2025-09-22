import React, { useState, useEffect } from "react";
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
  // Formatear valores
  const formatNumber = n => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // Calcular años y meses
  const years = Math.floor(Number(plazo) / 12);
  const months = Number(plazo) % 12;
  let plazoTexto = `${plazo} meses`;
  if (years > 0) {
    plazoTexto += ` (${years} año${years > 1 ? 's' : ''}${months > 0 ? ' y ' + months + ' mes' + (months > 1 ? 'es' : '') : ''})`;
  }
  const total = Number(cuota) * Number(plazo);
  const mensaje =
    `*Hola, te saluda ${nombre}.*%0A%0A` +
    `Tu cotización de *${producto}* es la siguiente:%0A` +
    `Plazo: *${plazoTexto}*%0A` +
    `Prima: L ${formatNumber(prima)}%0A` +
    `Cuota mensual: L ${formatNumber(cuota)}%0A` +
    `Total a pagar: L ${formatNumber(total)}%0A%0A` +
    `Llena este link para avanzar con el ingreso de la solicitud:%0A` +
    encodeURIComponent(url);

  // Abrir WhatsApp según dispositivo
  const isMobileScreen = typeof window !== "undefined" && window.innerWidth < 900;
  if (isMobileScreen) {
    window.open(`https://wa.me/${cel}?text=${mensaje}`, "_blank");
  } else {
    window.open(`https://web.whatsapp.com/send?phone=504${cel}&text=${mensaje}`, "_blank");
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
