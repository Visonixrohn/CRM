import React from "react";

const motivos = [
  { key: "no_contestan", label: "No contesta", color: "#fbbf24", bg: "#fef3c7" },
  { key: "no_quiere", label: "No quiere", color: "#ef4444", bg: "#fee2e2" },
  { key: "si_quiere", label: "Sí quiere", color: "#22c55e", bg: "#bbf7d0" },
  { key: "a_eliminar", label: "A eliminar", color: "#334155", bg: "#e0e7ef" }
];

export default function ModalSeleccionMotivo({ open, onClose, onSelect }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.25)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 36,
        minWidth: 320,
        boxShadow: '0 8px 32px #0003',
        textAlign: 'center',
        position: 'relative',
        maxWidth: '90vw',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 18, background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: '#64748b' }}>&times;</button>
        <h3 style={{ marginBottom: 28, color: '#1e293b', fontWeight: 700 }}>Selecciona el motivo</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {motivos.map(motivo => (
            <button
              key={motivo.key}
              onClick={() => onSelect(motivo.key)}
              style={{
                padding: '14px 0',
                borderRadius: 10,
                border: `1.5px solid ${motivo.color}`,
                background: motivo.bg,
                color: motivo.color,
                fontWeight: 600,
                fontSize: 17,
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {motivo.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
