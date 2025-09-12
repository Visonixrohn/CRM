import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import "./DetalleDocumento.css";

const DetalleDocumento = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { nombre, url } = location.state || {};

  // Manejo de historial para botón atrás
  const firstRender = useRef(true);
  useEffect(() => {
    if (url) {
      if (!firstRender.current) {
        window.history.pushState({ modal: 'detalleDocumento' }, '');
      }
      const handlePop = (e) => {
        navigate(-1);
      };
      window.addEventListener('popstate', handlePop);
      return () => {
        window.removeEventListener('popstate', handlePop);
        if (!firstRender.current && url) {
          window.history.back();
        }
      };
    }
    firstRender.current = false;
  }, [url]);
  if (!url) {
    return (
      <div className="detalle-container">
        <h1>Error</h1>
        <p>No se pudo cargar el documento.</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="detalle-container">
      <h1>{nombre}</h1>
      <iframe
        src={url}
        title="Vista Previa del Documento"
        width="100%"
        height="600px"
        style={{ border: "none" }}
      ></iframe>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        Volver
      </button>
    </div>
  );
};

export default DetalleDocumento;
