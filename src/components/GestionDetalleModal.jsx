import React, { useState, useEffect } from "react";
import { FaUser, FaPhone, FaStore, FaTag, FaIdCard, FaWhatsapp, FaChevronLeft, FaChevronRight, FaTimes, FaCheckCircle } from "react-icons/fa";
import "./GestionDetalleModal.css";

const GestionDetalleModal = ({ open, cliente, onClose, allClientes, onWhatsApp, onMarcarGestion, onLink }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCliente, setCurrentCliente] = useState(cliente);

  useEffect(() => {
    if (cliente && allClientes && allClientes.length > 0) {
      const index = allClientes.findIndex(c => 
        (c.ID || c.id) === (cliente.ID || cliente.id)
      );
      setCurrentIndex(index >= 0 ? index : 0);
      setCurrentCliente(allClientes[index >= 0 ? index : 0]);
    } else {
      setCurrentCliente(cliente);
    }
  }, [cliente, allClientes]);

  if (!open || !currentCliente) return null;

  const handlePrevious = () => {
    if (currentIndex > 0 && allClientes && allClientes.length > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setCurrentCliente(allClientes[newIndex]);
    }
  };

  const handleNext = () => {
    if (allClientes && currentIndex < allClientes.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentCliente(allClientes[newIndex]);
    }
  };

  const formatId = (id) => {
    const idStr = String(id);
    return idStr.length === 12 ? '0' + idStr : idStr;
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
      alert('ID copiado al portapapeles');
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        alert('ID copiado al portapapeles');
      } catch (err) {
        alert("Error al copiar");
      }
    }
  };

  return (
    <div className="gestion-modal-overlay">
      <div className="gestion-modal-container">
        {/* Close Button */}
        <button className="gestion-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Navigation Arrows */}
        {allClientes && allClientes.length > 1 && (
          <>
            <button 
              className="gestion-modal-nav gestion-modal-nav-left" 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <FaChevronLeft />
            </button>
            <button 
              className="gestion-modal-nav gestion-modal-nav-right" 
              onClick={handleNext}
              disabled={currentIndex === allClientes.length - 1}
            >
              <FaChevronRight />
            </button>
          </>
        )}

        {/* Header */}
        <div className="gestion-modal-header">
          <div className="gestion-modal-avatar">
            <FaUser size={32} />
          </div>
          <div>
            <h2 className="gestion-modal-title">
              {(currentCliente.NOMBRES || currentCliente.nombre)} {(currentCliente.APELLIDOS || currentCliente.apellido)}
            </h2>
            <p className="gestion-modal-subtitle">
              {allClientes ? `Cliente ${currentIndex + 1} de ${allClientes.length}` : 'Detalles del cliente'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="gestion-modal-body">
          {/* ID Card */}
          <div className="gestion-detail-card">
            <div className="gestion-detail-icon" style={{ background: '#dbeafe' }}>
              <FaIdCard color="#3b82f6" />
            </div>
            <div className="gestion-detail-content">
              <div className="gestion-detail-label">Identificación</div>
              <div className="gestion-detail-value">
                {formatId(currentCliente.ID || currentCliente.id)}
                <button 
                  className="gestion-copy-btn"
                  onClick={() => copyToClipboard(formatId(currentCliente.ID || currentCliente.id))}
                  title="Copiar ID"
                >
                  📋
                </button>
              </div>
            </div>
          </div>

          {/* Phone Card */}
          {(currentCliente.TELEFONO || currentCliente.tel) && (
            <div className="gestion-detail-card">
              <div className="gestion-detail-icon" style={{ background: '#d1fae5' }}>
                <FaPhone color="#059669" />
              </div>
              <div className="gestion-detail-content">
                <div className="gestion-detail-label">Teléfono</div>
                <div className="gestion-detail-value">
                  <a 
                    href={`tel:${currentCliente.TELEFONO || currentCliente.tel}`}
                    className="gestion-phone-link"
                  >
                    {currentCliente.TELEFONO || currentCliente.tel}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Store Card */}
          {(currentCliente.TIENDA || currentCliente.tienda) && (
            <div className="gestion-detail-card">
              <div className="gestion-detail-icon" style={{ background: '#fef3c7' }}>
                <FaStore color="#d97706" />
              </div>
              <div className="gestion-detail-content">
                <div className="gestion-detail-label">Tienda</div>
                <div className="gestion-detail-value">
                  {currentCliente.TIENDA || currentCliente.tienda}
                </div>
              </div>
            </div>
          )}

          {/* Segment Card */}
          {(currentCliente.SEGMENTO || currentCliente.segmento) && (
            <div className="gestion-detail-card">
              <div className="gestion-detail-icon" style={{ background: '#e9d5ff' }}>
                <FaTag color="#9333ea" />
              </div>
              <div className="gestion-detail-content">
                <div className="gestion-detail-label">Segmento</div>
                <div className="gestion-detail-value">
                  {currentCliente.SEGMENTO || currentCliente.segmento}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="gestion-modal-footer">
          <button 
            className="gestion-action-btn gestion-btn-whatsapp"
            onClick={() => onWhatsApp && onWhatsApp(currentCliente)}
          >
            <FaWhatsapp />
            WhatsApp
          </button>
          <button 
            className="gestion-action-btn gestion-btn-link"
            onClick={() => onLink && onLink(currentCliente)}
          >
            🔗 Link
          </button>
          <button 
            className="gestion-action-btn gestion-btn-marcar"
            onClick={() => onMarcarGestion && onMarcarGestion(currentCliente)}
          >
            <FaCheckCircle />
            Marcar gestión
          </button>
        </div>
      </div>
    </div>
  );
};

export default GestionDetalleModal;
