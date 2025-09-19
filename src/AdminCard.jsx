import React from "react";

export default function AdminCard({ usuario, onEdit }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 12px #e0e7ff',
      margin: '16px 0',
      padding: 18,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      fontSize: 15,
      position: 'relative',
    }}>
      {Object.entries(usuario).map(([key, value]) => (
        <div key={key} style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontWeight: 600, color: '#6366f1', minWidth: 90 }}>{key}:</span>
          <span>{typeof value === 'boolean' ? (value ? 'Sí' : 'No') : (value || '-')}</span>
        </div>
      ))}
      <button
        onClick={() => onEdit(usuario)}
        style={{
          background: '#6366f1',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '6px 14px',
          fontWeight: 600,
          cursor: 'pointer',
          alignSelf: 'flex-end',
          marginTop: 8
        }}
      >
        Editar
      </button>
    </div>
  );
}
