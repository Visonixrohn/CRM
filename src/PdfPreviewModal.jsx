import React from "react";
import Modal from "react-modal";
import "./PdfPreviewModal.css";

const PdfPreviewModal = ({ isOpen, onRequestClose, pdfUrl }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="pdf-modal-content"
      overlayClassName="pdf-modal-overlay"
    >
      <div className="pdf-modal-header">
        <h2>Vista Previa del Documento</h2>
        <button onClick={onRequestClose} className="close-button">
          &times;
        </button>
      </div>
      <div className="pdf-modal-body">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="Vista Previa del Documento PDF"
            width="100%"
            height="500px"
            style={{ border: "none" }}
          ></iframe>
        ) : (
          <p>No se pudo cargar el documento.</p>
        )}
      </div>
    </Modal>
  );
};

export default PdfPreviewModal;
