import React from "react";
import "./OrdenesServicioCardMovil.css";

const OrdenesServicioCard = ({ orden, onVerDetalle, ext, onConsultarCorOne, loadingCorOne }) => {
  const estadosPermitidos = ["PENDIENTE DE VISITA", "PENDIENTE DE REPUESTO"];
  const mostrarResuelto = !estadosPermitidos.includes(orden.estado);
  
  const estado = orden.estado || '';
  const statusRaw = ext && ext.status ? ext.status : (orden.status || '');
  
  // Determinar si la orden está finalizada
  const esPendiente = estado !== 'FINALIZADO' && estado !== 'ANULADA' && estado !== 'REPARADO' && statusRaw !== 'Tu orden ha finalizado';
  
  // Clase de estado
  let estadoClass = 'estado-pendiente';
  if (estado === 'FINALIZADO' || estado === 'REPARADO' || statusRaw === 'Tu orden ha finalizado') {
    estadoClass = 'estado-finalizado';
  } else if (estado === 'ANULADA') {
    estadoClass = 'estado-anulada';
  } else if (estado === 'PENDIENTE DE REPUESTO') {
    estadoClass = 'estado-repuesto';
  }
  
  return (
    <div className="orden-card-movil-modern">
      <div className="card-header-movil">
        <div className="orden-numero-movil">
          <span className="orden-icon">📋</span>
          <span className="orden-text">#{orden.numero_orden}</span>
        </div>
        <span className={`estado-badge-movil ${estadoClass}`}>
          {estado || 'Sin estado'}
        </span>
      </div>

      <div className="card-body-movil">
        <div className="info-row-movil">
          <span className="info-icon">👤</span>
          <div className="info-content">
            <span className="info-label">Cliente</span>
            <span className="info-value">{orden.cliente}</span>
          </div>
        </div>

        <div className="info-row-movil">
          <span className="info-icon">📅</span>
          <div className="info-content">
            <span className="info-label">Fecha</span>
            <span className="info-value">{orden.fecha}</span>
          </div>
        </div>

        {orden.telefono && (
          <div className="info-row-movil">
            <span className="info-icon">📞</span>
            <div className="info-content">
              <span className="info-label">Teléfono</span>
              <span className="info-value">{orden.telefono}</span>
            </div>
          </div>
        )}

        {orden.gestor && (
          <div className="info-row-movil">
            <span className="info-icon">👨‍💼</span>
            <div className="info-content">
              <span className="info-label">Gestor</span>
              <span className="info-value">{orden.gestor}</span>
            </div>
          </div>
        )}

        {/* Información del modelo/marca */}
        {(ext || mostrarResuelto) && (
          <div className="info-extra-movil">
            <div className="info-row-movil compact">
              <span className="info-icon-small">📱</span>
              <div className="info-content">
                <span className="info-label-small">Modelo</span>
                <span className="info-value-small">
                  {mostrarResuelto ? 'RESUELTO' : loadingCorOne ? 'Cargando...' : ext && ext.model ? ext.model : '-'}
                </span>
              </div>
            </div>
            <div className="info-row-movil compact">
              <span className="info-icon-small">🏷️</span>
              <div className="info-content">
                <span className="info-label-small">Marca</span>
                <span className="info-value-small">
                  {mostrarResuelto ? 'RESUELTO' : loadingCorOne ? 'Cargando...' : ext && ext.brand ? ext.brand : '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        {statusRaw && (
          <div className="status-row-movil">
            <span className="status-label-movil">Status:</span>
            <span className="status-value-movil">{statusRaw}</span>
          </div>
        )}
      </div>

      <div className="card-actions-movil">
        <button 
          className="btn-consultar-movil" 
          onClick={onConsultarCorOne}
          title="Actualizar información"
          disabled={loadingCorOne}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {loadingCorOne ? 'Cargando...' : 'Actualizar'}
        </button>
        <button 
          className="btn-detalle-movil" 
          onClick={() => onVerDetalle && onVerDetalle(orden)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2"/>
            <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Ver Detalle
        </button>
      </div>
    </div>
  );
};

export default OrdenesServicioCard;
