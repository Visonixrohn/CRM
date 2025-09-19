import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import ModalEditarUsuario from "./ModalEditarUsuario";
import { hashPassword } from "./utils/hash";

const ROLES = ["usuario", "Admin", "superadmin"];

export default function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioEdit, setUsuarioEdit] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUsuarios();
  }, []);

  async function fetchUsuarios() {
    setLoading(true);
    setError("");
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) setError("Error al cargar usuarios");
    else setUsuarios(data);
    setLoading(false);
  }

  function handleBuscar(e) {
    setBusqueda(e.target.value);
  }

  function handleEditClick(usuario) {
    setUsuarioEdit(usuario.id);
    setEditData({ ...usuario });
    setSuccess("");
    setError("");
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleGuardar(nuevaContrasena) {
    setLoading(true);
    setError("");
    setSuccess("");
    const { id, ...rest } = editData;
    let updates = { ...rest };
    if (nuevaContrasena && nuevaContrasena.length > 0) {
      try {
        updates.contrasena = await hashPassword(nuevaContrasena);
      } catch (e) {
        setError("Error al cifrar la contraseña");
        setLoading(false);
        return;
      }
    }
    const { error } = await supabase.from("profiles").update(updates).eq("id", id);
    if (error) setError("Error al actualizar usuario");
    else {
      setSuccess("Usuario actualizado");
      setUsuarioEdit(null);
      fetchUsuarios();
      // Si el usuario editado es el actual y acceso es denegado, cerrar sesión
      const currentUserId = localStorage.getItem("userId");
      if (id === currentUserId && updates.acceso === "denegado") {
        localStorage.clear();
        window.location.href = "/";
      }
    }
    setLoading(false);
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const texto = `${u.nombre || ""} ${u.email || ""} ${u.id || ""}`.toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  // Obtener todas las llaves de la tabla (columnas)
  const columnas = usuarios.length > 0 ? Object.keys(usuarios[0]) : [];

  return (
  <div style={{ padding: 32, maxWidth: '78vw', margin: '0 auto' }}>
      <h1 style={{ fontWeight: 800, color: '#3730a3', marginBottom: 24 }}>Administración de Usuarios</h1>
      <input
        type="text"
        placeholder="Buscar usuario por nombre, email o ID"
        value={busqueda}
        onChange={handleBuscar}
        style={{ marginBottom: 24, padding: 10, width: 350, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 16, boxShadow: '0 1px 4px #e0e7ff' }}
      />
      <div style={{ marginBottom: 12, fontWeight: 600, color: '#3730a3', fontSize: 18 }}>
        Total de usuarios: {usuariosFiltrados.length}
      </div>
      {loading && <div style={{ margin: '16px 0' }}>Cargando...</div>}
      {error && <div style={{ color: "#b91c1c", margin: '12px 0' }}>{error}</div>}
      {success && <div style={{ color: "#15803d", margin: '12px 0' }}>{success}</div>}
      <div style={{
        overflowX: 'auto',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 12px #e0e7ff',
        marginTop: 16,
        maxWidth: '100vw',
        padding: 0,
        WebkitOverflowScrolling: 'touch',
      }}>
        <table style={{
          width: '1800px',
          minWidth: '1200px',
          borderCollapse: 'collapse',
          tableLayout: 'auto',
        }}>
          <thead>
            <tr style={{ background: '#6366f1', color: '#fff' }}>
              {columnas.map(col => (
                <th key={col} style={{ padding: '12px 8px', fontWeight: 700 }}>{col}</th>
              ))}
              <th style={{ padding: '12px 8px', fontWeight: 700 }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map((u, idx) => (
              <tr key={u.id} style={{ background: idx % 2 === 0 ? '#f1f5f9' : '#fff', transition: 'background 0.2s' }}>
                {columnas.map(col => (
                  <td key={col} style={{ padding: '10px 8px' }}>
                    {usuarioEdit === u.id ? (
                      col === 'rol' ? (
                        <select
                          name="rol"
                          value={editData.rol || ""}
                          onChange={handleEditChange}
                          style={{ padding: 6, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15 }}
                        >
                          <option value="">Seleccionar</option>
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      ) : col === 'acceso' ? (
                        <select
                          name="acceso"
                          value={editData.acceso || ""}
                          onChange={handleEditChange}
                          style={{ padding: 6, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15 }}
                        >
                          <option value="">Seleccionar</option>
                          <option value="permitido">Permitido</option>
                          <option value="denegado">Denegado</option>
                        </select>
                      ) : (
                        <input
                          name={col}
                          value={editData[col] || ""}
                          onChange={handleEditChange}
                          style={{ padding: 6, borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 15 }}
                        />
                      )
                    ) : (
                      typeof u[col] === 'boolean' ? (u[col] ? 'Sí' : 'No') : (u[col] || '-')
                    )}
                  </td>
                ))}
                <td style={{ padding: '10px 8px' }}>
                  {usuarioEdit === u.id ? (
                    <>
                      <button onClick={handleGuardar} disabled={loading} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', marginRight: 6, fontWeight: 600, cursor: 'pointer' }}>Guardar</button>
                      <button onClick={() => setUsuarioEdit(null)} disabled={loading} style={{ background: '#e5e7eb', color: '#334155', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
                    </>
                  ) : (
                    <button onClick={() => handleEditClick(u)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 600, cursor: 'pointer' }}>Editar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ModalEditarUsuario
        open={!!usuarioEdit}
        usuario={editData}
        onChange={handleEditChange}
        onClose={() => setUsuarioEdit(null)}
        onSave={handleGuardar}
        loading={loading}
        roles={ROLES}
      />
    </div>
  );
}
