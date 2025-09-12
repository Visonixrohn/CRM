import React from "react";
import "./EntregaCard.css";

const EntregaCard = ({ entrega, onEdit, onDelete }) => {
  // Alerta visual para fecha de entrega
  const hoy = new Date();
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  const hoyStr = `${yyyy}-${mm}-${dd}`;
  const fechaEntrega = entrega.fecha_entrega;
  const estatusLower = String(entrega.estatus).toLowerCase();

  let alertaEntrega = null;
  if (fechaEntrega === hoyStr && estatusLower !== 'entregado') {
    alertaEntrega = (
      <div style={{background:'#fbbf24',color:'#b45309',padding:'2px 8px',borderRadius:6,fontWeight:'bold',marginBottom:6,textAlign:'center'}}>
        ENTREGA PARA HOY
      </div>
    );
  } else if (fechaEntrega < hoyStr && estatusLower !== 'entregado') {
    alertaEntrega = (
      <div style={{background:'#ef4444',color:'#fff',padding:'2px 8px',borderRadius:6,fontWeight:'bold',marginBottom:6,textAlign:'center'}}>
        ENTREGA ATRASADA
      </div>
    );
  }

  return (
    <div className="entrega-card">
      {alertaEntrega}
      <div className="entrega-card-row">
        <span className="entrega-card-label">Cliente:</span>
        <span className="entrega-card-value">{entrega.cliente}</span>
      </div>
      <div className="entrega-card-row">
        <span className="entrega-card-label">Factura:</span>
        <span className="entrega-card-value">{entrega.factura}</span>
      </div>
      <div className="entrega-card-row">
        <span className="entrega-card-label">Cel:</span>
        {entrega.cel && (
          <a
            href={`https://web.whatsapp.com/send?phone=504${entrega.cel.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chatear por WhatsApp"
            style={{ marginRight: 8, color: '#25D366', fontSize: '1.3em', verticalAlign: 'middle', textDecoration: 'none' }}
            onClick={ev => ev.stopPropagation()}
          >
            <svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor" style={{verticalAlign:'middle'}}>
              <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.824-2.05C13.41 27.633 14.686 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.13 0-2.238-.188-3.287-.558l-.235-.08-4.646 1.217 1.24-4.527-.153-.236C7.188 19.238 7 18.13 7 17c0-4.963 4.037-9 9-9s9 4.037 9 9-4.037 9-9 9zm5.29-6.709c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.02-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.08-1.28-.77-.68-1.29-1.52-1.44-1.78-.15-.26-.02-.4.11-.53.11-.11.26-.29.39-.44.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.21-.51-.43-.44-.58-.45-.15-.01-.32-.01-.5-.01-.17 0-.45.06-.68.28-.23.22-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.81 2.77 4.39 3.78.61.21 1.09.33 1.46.42.61.13 1.16.11 1.6.07.49-.05 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3z"/>
            </svg>
          </a>
        )}
        <span className="entrega-card-value">{entrega.cel}</span>
      </div>
      {entrega.ubicacion && (
        <div className="entrega-card-row">
          <span className="entrega-card-label">Ubicación:</span>
          <a
            className="entrega-card-value"
            href={entrega.ubicacion}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'underline', wordBreak: 'break-all' }}
          >
            Ver en Google Maps
          </a>
        </div>
      )}
     
      <div className="entrega-card-row">
        <span className="entrega-card-label">Tipo Entrega:</span>
        <span className="entrega-card-badge tipo">{entrega.tipo_entrega}</span>
      </div>
      <div className="entrega-card-row">
        <span className="entrega-card-label">Gestionada:</span>
        <span className="entrega-card-badge gestionada">{entrega.gestionada}</span>
      </div>
      <div className="entrega-card-row">
        <span className="entrega-card-label">Estado:</span>
        <span className={`entrega-card-badge status status-${entrega.estatus}`}>{entrega.estatus}</span>
      </div>
      <div className="entrega-card-actions">
        <button className="entrega-card-btn edit" onClick={() => onEdit(entrega)}>
          ✏️
        </button>
       
      </div>
    </div>
  );
};

export default EntregaCard;
