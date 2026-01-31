import React from "react";
import { FaMapMarkerAlt, FaWhatsapp, FaPhone, FaEdit, FaCheckCircle, FaUser, FaFileInvoice, FaBox, FaTruck, FaClipboardCheck, FaCalendar, FaClock } from "react-icons/fa";
import "../ModalesNew.css";
import "./DetalleEntregaModal.css";

const DetalleEntregaModal = ({ open, entrega, onClose, onActualizarEstatus, onActualizarDatos }) => {
  if (!open || !entrega) return null;

  // Extraer coordenadas de la ubicación
  let urlMaps = null;
  let lat = null;
  let lng = null;
  if (entrega.ubicacion) {
    const match = entrega.ubicacion.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      lat = parseFloat(match[1]);
      lng = parseFloat(match[2]);
      urlMaps = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
  }

  const getEstatusInfo = (estatus) => {
    switch (estatus?.toLowerCase()) {
      case 'entregado': 
        return { color: '#22c55e', icon: '✅', text: 'Entregado', gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' };
      case 'rechazado': 
        return { color: '#ef4444', icon: '❌', text: 'Rechazado', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' };
      case 'reprogramado': 
        return { color: '#f59e0b', icon: '🔄', text: 'Reprogramado', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' };
      default: 
        return { color: '#3b82f6', icon: '⏳', text: 'Pendiente', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' };
    }
  };

  const estatusInfo = getEstatusInfo(entrega.estatus);

  // Calcular tiempo transcurrido
  const calcularTiempo = () => {
    if (!entrega.fecha_entrega) return null;
    const fechaEntrega = new Date(entrega.fecha_entrega);
    const ahora = new Date();
    const diffMs = ahora - fechaEntrega;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) return `⚠️ ${diffDays} día${diffDays > 1 ? 's' : ''} de retraso`;
    if (diffDays === 0) return '📅 Hoy es el día';
    return `⏰ Faltan ${Math.abs(diffDays)} día${Math.abs(diffDays) > 1 ? 's' : ''}`;
  };

  const tiempoInfo = calcularTiempo();

  return (
    <div className="modal-overlay">
      <div className="modal-container modal-detalle-entrega-new">
        <button className="modal-close-btn-new" onClick={onClose}>×</button>
        
        {/* Header con estado */}
        <div className="detalle-header" style={{ background: estatusInfo.gradient }}>
          <div className="detalle-header-content">
            <div className="detalle-status-icon">{estatusInfo.icon}</div>
            <div>
              <h3 className="detalle-header-title">{entrega.cliente}</h3>
              <div className="detalle-header-status">{estatusInfo.text}</div>
            </div>
          </div>
        </div>

        <div className="detalle-body">
          {/* Información principal en cards */}
          <div className="detalle-grid">
            {/* Card Cliente */}
            <div className="detalle-card">
              <div className="detalle-card-icon" style={{ background: '#e0e7ff' }}>
                <FaUser color="#4f46e5" />
              </div>
              <div className="detalle-card-content">
                <div className="detalle-card-label">Cliente</div>
                <div className="detalle-card-value">{entrega.cliente}</div>
              </div>
            </div>

            {/* Card Factura */}
            <div className="detalle-card">
              <div className="detalle-card-icon" style={{ background: '#fef3c7' }}>
                <FaFileInvoice color="#d97706" />
              </div>
              <div className="detalle-card-content">
                <div className="detalle-card-label">Factura</div>
                <div className="detalle-card-value">{entrega.factura}</div>
              </div>
            </div>

            {/* Card Artículo */}
            {entrega.articulo && (
              <div className="detalle-card detalle-card-full">
                <div className="detalle-card-icon" style={{ background: '#dbeafe' }}>
                  <FaBox color="#2563eb" />
                </div>
                <div className="detalle-card-content">
                  <div className="detalle-card-label">Artículo</div>
                  <div className="detalle-card-value">{entrega.articulo}</div>
                </div>
              </div>
            )}

            {/* Card Tipo de Entrega */}
            {entrega.tipo_entrega && (
              <div className="detalle-card">
                <div className="detalle-card-icon" style={{ background: '#e9d5ff' }}>
                  <FaTruck color="#9333ea" />
                </div>
                <div className="detalle-card-content">
                  <div className="detalle-card-label">Tipo</div>
                  <div className="detalle-card-value">{entrega.tipo_entrega}</div>
                </div>
              </div>
            )}

            {/* Card Gestión */}
            {entrega.gestionada && (
              <div className="detalle-card">
                <div className="detalle-card-icon" style={{ background: '#d1fae5' }}>
                  <FaClipboardCheck color="#059669" />
                </div>
                <div className="detalle-card-content">
                  <div className="detalle-card-label">Gestión</div>
                  <div className="detalle-card-value">{entrega.gestionada}</div>
                </div>
              </div>
            )}

            {/* Card Fecha */}
            {entrega.fecha_entrega && (
              <div className="detalle-card detalle-card-full">
                <div className="detalle-card-icon" style={{ background: '#fee2e2' }}>
                  <FaCalendar color="#dc2626" />
                </div>
                <div className="detalle-card-content">
                  <div className="detalle-card-label">Fecha de entrega</div>
                  <div className="detalle-card-value">{entrega.fecha_entrega}</div>
                  {tiempoInfo && (
                    <div className="detalle-tiempo-info">{tiempoInfo}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sección de contacto */}
          {entrega.cel && (
            <div className="detalle-contact-section">
              <div className="detalle-section-title">
                <FaPhone /> Contacto
              </div>
              <div className="detalle-contact-info">
                <span className="detalle-phone-number">{entrega.cel}</span>
                <div className="detalle-contact-actions">
                  <button
                    className="btn-contact btn-whatsapp"
                    onClick={() => window.open(`https://wa.me/504${entrega.cel.replace(/[^\d]/g, "")}`, '_blank')}
                  >
                    <FaWhatsapp /> WhatsApp
                  </button>
                  <button
                    className="btn-contact btn-phone"
                    onClick={() => window.location.href = `tel:${entrega.cel}`}
                  >
                    <FaPhone /> Llamar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sección de ubicación */}
          {entrega.ubicacion && urlMaps && (
            <div className="detalle-location-section">
              <div className="detalle-section-title">
                <FaMapMarkerAlt /> Ubicación
              </div>
              <button
                className="btn-location"
                onClick={() => window.open(urlMaps, '_blank')}
              >
                <FaMapMarkerAlt />
                <span>Abrir en Google Maps</span>
                <span className="location-arrow">→</span>
              </button>
            </div>
          )}
        </div>

        {/* Botones de acción principales */}
        <div className="detalle-footer">
          <button 
            className="btn-action btn-action-status"
            onClick={onActualizarEstatus}
          >
            <FaCheckCircle /> Actualizar Estado
          </button>
          <button 
            className="btn-action btn-action-edit"
            onClick={onActualizarDatos}
          >
            <FaEdit /> Editar Datos
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleEntregaModal;
