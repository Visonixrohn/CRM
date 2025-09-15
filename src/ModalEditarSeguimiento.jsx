import React, { useState } from "react";

const ESTADOS = [
  "Gestionado",
  "Reprogramado",
  "Facturado",
  "Rechazado"
];

export default function ModalEditarSeguimiento({ open, onClose, row, onSave }) {
  const [estado, setEstado] = useState(row?.estado || "");
  const [fecha, setFecha] = useState(row?.fecha_de_acuerdo || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGuardar = async () => {
    setLoading(true);
    setError("");
    try {
      await onSave({ estado, fecha_de_acuerdo: estado === "Reprogramado" ? fecha : row.fecha_de_acuerdo });
      onClose();
    } catch (e) {
      setError(e.message || e);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#0008", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, minWidth: 320, boxShadow: "0 8px 32px #0003", maxWidth: 90 }}>
        <h3 style={{ marginBottom: 18 }}>Actualizar estado</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: 600 }}>Estado:</label>
          <select value={estado} onChange={e => setEstado(e.target.value)} style={{ marginLeft: 8, padding: 8, borderRadius: 8, border: "1px solid #cbd5e1" }}>
            <option value="">Selecciona...</option>
            {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        {estado === "Reprogramado" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600 }}>Nueva fecha de acuerdo:</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ marginLeft: 8, padding: 8, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          </div>
        )}
        {error && <div style={{ color: "#ef4444", marginBottom: 10 }}>{error}</div>}
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          <button onClick={onClose} style={{ background: "#e5e7eb", color: "#334155", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 500 }}>Cancelar</button>
          <button onClick={handleGuardar} disabled={loading || !estado || (estado === "Reprogramado" && !fecha)} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 600, opacity: loading ? 0.7 : 1 }}>{loading ? "Guardando..." : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}
