
import React, { useState } from "react";

const motivos = [
  { key: "no_contestan", label: "No contesta", color: "#fbbf24", bg: "#fef3c7" },
  { key: "no_quiere", label: "No quiere", color: "#ef4444", bg: "#fee2e2" },
  { key: "si_quiere", label: "Sí quiere", color: "#22c55e", bg: "#bbf7d0" },
  { key: "a_eliminar", label: "A eliminar", color: "#334155", bg: "#e0e7ef" }
];

export default function ModalSeleccionMotivo({ open, onClose, onSave, loading }) {
  const [motivo, setMotivo] = useState(null);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
          {motivos.map(m => (
            <button
              key={m.key}
              onClick={() => setMotivo(m.key)}
              style={{
                padding: '14px 0',
                borderRadius: 10,
                border: `1.5px solid ${m.color}`,
                background: motivo === m.key ? m.color : m.bg,
                color: motivo === m.key ? '#fff' : m.color,
                fontWeight: 600,
                fontSize: 17,
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
                outline: motivo === m.key ? '2px solid #6366f1' : 'none',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18 }}>
          <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#e5e7eb', color: '#334155', fontWeight: 600, fontSize: 16 }}>Cancelar</button>
          <button
            onClick={() => motivo && onSave(motivo)}
            disabled={!motivo || loading}
            style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: motivo ? '#6366f1' : '#cbd5e1', color: '#fff', fontWeight: 600, fontSize: 16, opacity: loading ? 0.7 : 1, cursor: motivo && !loading ? 'pointer' : 'not-allowed' }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
