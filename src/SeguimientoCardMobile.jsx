import React, { useState } from "react";

const colorEstado = (estado) => {
  switch ((estado || "").toLowerCase()) {
    case "gestionado": return "#22c55e";
    case "reprogramado": return "#fbbf24";
    case "facturado": return "#6366f1";
    case "rechazado": return "#ef4444";
    default: return "#64748b";
  }
};

export default function SeguimientoCard({ row, onClick }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="seguimiento-card-mobile" onClick={() => onClick(row)}>
      <div className="scm-row">
        <div className="scm-nombre">{row.nombre_cliente}</div>
        <div className="scm-estado" style={{background: colorEstado(row.estado)}}>{row.estado}</div>
      </div>
      <div className="scm-info">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <b>DNI:</b> {row.dni}
          <button
            title="Copiar DNI"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              verticalAlign: 'middle',
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={e => {
              e.stopPropagation();
              if (navigator && navigator.clipboard) {
                navigator.clipboard.writeText(row.dni);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 1200);
              }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle'}}>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          {copiado && <span style={{color:'#22c55e',fontSize:12,marginLeft:4}}>¡Copiado!</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <b>Cel:</b> {row.cel}
          {row.cel && (
            <>
              <a
                href={`https://wa.me/504${row.cel.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Chatear por WhatsApp"
                style={{ color: '#25D366', fontSize: '1.2em', textDecoration: 'none' }}
                onClick={ev => ev.stopPropagation()}
              >
                <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" style={{verticalAlign:'middle'}}>
                  <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.824-2.05C13.41 27.633 14.686 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.13 0-2.238-.188-3.287-.558l-.235-.08-4.646 1.217 1.24-4.527-.153-.236C7.188 19.238 7 18.13 7 17c0-4.963 4.037-9 9-9s9 4.037 9 9-4.037 9-9 9zm5.29-6.709c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.02-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.08-1.28-.77-.68-1.29-1.52-1.44-1.78-.15-.26-.02-.4.11-.53.11-.11.26-.29.39-.44.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.21-.51-.43-.44-.58-.45-.15-.01-.32-.01-.5-.01-.17 0-.45.06-.68.28-.23.22-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.81 2.77 4.39 3.78.61.21 1.09.33 1.46.42.61.13 1.16.11 1.6.07.49-.05 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3z"/>
                </svg>
              </a>
              <a
                href={`tel:${row.cel}`}
                title="Llamar"
                style={{ color: '#2563eb', fontSize: '1.2em', textDecoration: 'none' }}
                onClick={ev => ev.stopPropagation()}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{verticalAlign:'middle'}}>
                  <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 5a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.46.57 3.58a1 1 0 01-.24 1.01l-2.2 2.2z"/>
                </svg>
              </a>
            </>
          )}
        </div>
        <div><b>Artículo:</b> {row.articulo}</div>
        <div><b>Tipo:</b> {row.tipo}</div>
        <div><b>Fecha:</b> {row.fecha_de_acuerdo}</div>
      </div>
    </div>
  );
}
