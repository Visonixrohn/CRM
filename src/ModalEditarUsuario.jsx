import React, { useState } from "react";

export default function ModalEditarUsuario({ open, usuario, onChange, onClose, onSave, loading, roles }) {
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  if (!open) return null;
  // Mostrar todos los campos editables, excepto contrasena (se reemplaza por campo nueva contraseña)
  const campos = Object.keys(usuario || {}).filter(
    (key) => key !== "id" && key !== "created_at" && key !== "contrasena"
  );
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,41,59,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 340, boxShadow: '0 4px 32px #c7d2fe', position: 'relative', maxWidth: 420 }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#64748b', cursor: 'pointer' }}>&times;</button>
        <h2 style={{ marginBottom: 18, color: '#3730a3', fontWeight: 700 }}>Editar Usuario</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxHeight: 400, overflowY: 'auto' }}>
          {campos.map((campo) => (
            <label key={campo} style={{ fontWeight: 600, color: '#334155' }}>
              {campo.charAt(0).toUpperCase() + campo.slice(1)}
              {campo === 'rol' ? (
                <select name="rol" value={usuario.rol || ""} onChange={onChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}>
                  <option value="">Seleccionar</option>
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              ) : campo === 'acceso' ? (
                <select name="acceso" value={usuario.acceso || ""} onChange={onChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}>
                  <option value="">Seleccionar</option>
                  <option value="permitido">Permitido</option>
                  <option value="denegado">Denegado</option>
                </select>
              ) : (
                <input name={campo} value={usuario[campo] || ""} onChange={onChange} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }} />
              )}
            </label>
          ))}
          <label style={{ fontWeight: 600, color: '#334155' }}>
            Nueva contraseña
            <input
              name="nuevaContrasena"
              type="password"
              value={nuevaContrasena}
              onChange={e => setNuevaContrasena(e.target.value)}
              style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }}
              placeholder="Dejar vacío para no cambiar"
              autoComplete="new-password"
            />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 28, justifyContent: 'flex-end' }}>
          <button onClick={() => onSave(nuevaContrasena)} disabled={loading} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Guardar</button>
          <button onClick={onClose} disabled={loading} style={{ background: '#e5e7eb', color: '#334155', border: 'none', borderRadius: 8, padding: '8px 22px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
