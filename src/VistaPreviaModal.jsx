import React from "react";
import Modal from "react-modal";
import "./VistaPreviaModal.css";

const VistaPreviaModal = ({ isOpen, onRequestClose, url, nombre }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="modal-content"
      overlayClassName="modal-overlay"
    >
      <h2>{nombre}</h2>
      {url ? (
        <iframe
          src={url}
          title="Vista Previa del Documento"
          width="100%"
          height="500px"
          style={{ border: "none" }}
        ></iframe>
      ) : (
        <p>No se pudo cargar el documento.</p>
      )}
      <button onClick={onRequestClose} className="btn btn-secondary">
        Cerrar
      </button>
    </Modal>
  );
};

export default VistaPreviaModal;
