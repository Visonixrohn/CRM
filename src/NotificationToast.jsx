// src/NotificationToast.jsx
import React, { useEffect } from "react";
import "./NotificationToast.css";

export default function NotificationToast({ open, title, body, onClose, onViewEntregas }) {
  if (!open) return null;
  // Separar líneas de entregas (después del saludo)
  let saludo = body;
  let entregas = [];
  let nombre = "";
  if (body.includes('Tienes estas entregas pendientes:')) {
    const [sal, lista] = body.split('Tienes estas entregas pendientes:');
    // Extraer nombre del saludo
    const match = sal.match(/Hola ([^!]+)!/);
    nombre = match ? match[1] : "";
    saludo = `Bienvenido${nombre ? ' ' + nombre : ''} ! -- Aquí tienes tu actualización sobre las entregas:`;
    entregas = lista.trim().split('\n').filter(Boolean);
  }
  return (
    <div className="notification-toast-overlay">
      <div className="notification-toast">
        <div className="notification-toast-content">
          <div className="notification-toast-title-custom">{saludo}</div>
          <div className="notification-toast-body">
            {entregas.length > 0 && (
              <div className="notification-toast-list">
                {entregas.map((linea, i) => {
                  // Formato esperado: "Cliente = para hoy" o "Cliente = atrasada"
                  let estatus = "";
                  let cliente = "";
                  if (linea.includes("=")) {
                    const [cli, est] = linea.split("=");
                    cliente = cli.trim();
                    estatus = est.trim();
                  } else {
                    cliente = linea;
                  }
                  let color = estatus.includes("hoy") ? "#22c55e" : estatus.includes("atrasad") ? "#ef4444" : "#64748b";
                  return (
                    <div key={i} className="notification-toast-list-item">
                      <span className="notification-toast-estado" style={{ color, fontWeight: 700 }}>{estatus}</span>
                      {estatus && <span style={{ color: '#64748b', fontWeight: 400, margin: '0 6px' }}>:</span>}
                      <span className="notification-toast-cliente" style={{ fontWeight: 600 }}>{cliente}</span>
                      {i < entregas.length - 1 && <div className="notification-toast-divider" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="notification-toast-actions">
            <button className="notification-toast-action" onClick={onViewEntregas}>Ver entregas</button>
            <button className="notification-toast-close" onClick={onClose}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
