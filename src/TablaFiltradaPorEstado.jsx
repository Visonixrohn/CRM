import React, { useState } from "react";
import ModalSeleccionMotivo from "./ModalSeleccionMotivo";

// Asegúrate de exportar la función principal correctamente
export default function TablaFiltradaPorEstado({
  estado,
  filas = [], // valor por defecto para evitar errores
  eliminarCliente,
  eliminarTodos,
  eliminando,
  loading,
  error,
  navigate,
  setUpdate
}) {
  // Hooks y estados
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false);
  const [clienteGestionar, setClienteGestionar] = useState(null);

  // Estilos
  const regresarStyle = {
    marginBottom: 24,
    background: 'linear-gradient(90deg,#6366f1 0%,#818cf8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 28px',
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: 1,
    cursor: 'pointer',
    boxShadow: '0 2px 8px 0 rgba(80,80,120,0.10)',
    transition: 'background 0.2s, box-shadow 0.2s',
    outline: 'none',
    display: 'inline-block'
  };

  // Lógica para guardar motivo
  const handleGuardarMotivo = async motivo => {
    setModalMotivoOpen(false);
    setUpdate(Date.now());
  };

  // Cargando o error
  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  // Renderizado cuando el estado es "a_eliminar"
  if (estado === "a_eliminar") {
    return (
      <div style={{ padding: '0 8px' }}>
        <button
          onClick={() => navigate(-1)}
          style={regresarStyle}
          onMouseOver={e => e.currentTarget.style.background = '#6366f1'}
          onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg,#6366f1 0%,#818cf8 100%)'}
        >
          ← Regresar
        </button>
        <h2 style={{
          marginBottom: 24, marginTop: 0, fontWeight: 800, letterSpacing: 1.2,
          color: '#3730a3', fontSize: 28, textAlign: 'center', textTransform: 'capitalize'
        }}>
          Clientes a eliminar
        </h2>
        <button
          onClick={eliminarTodos}
          disabled={eliminando || filas.length === 0}
          style={{
            marginBottom: 18, background: "#ef4444", color: "#fff", padding: "10px 24px",
            border: "none", borderRadius: 8, fontWeight: 600, fontSize: 16,
            cursor: eliminando ? "not-allowed" : "pointer", opacity: eliminando ? 0.7 : 1
          }}
        >
          {eliminando ? "Eliminando..." : `Eliminar todos (${filas.length})`}
        </button>
        <div className="table-container">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombres</th>
                <th>Apellidos</th>
                <th>Teléfono</th>
                <th>Tienda</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(cliente => (
                <tr key={cliente.ID || cliente.id}>
                  <td>{cliente.ID || cliente.id}</td>
                  <td>{cliente.NOMBRES || cliente.nombre}</td>
                  <td>{cliente.APELLIDOS || cliente.apellido}</td>
                  <td>{cliente.TELEFONO || cliente.tel}</td>
                  <td>{cliente.TIENDA || cliente.tienda}</td>
                  <td>
                    <button
                      onClick={() => eliminarCliente(cliente.ID || cliente.id)}
                      disabled={eliminando}
                      style={{
                        background: "#ef4444", color: "#fff", padding: "6px 16px",
                        border: "none", borderRadius: 6, fontWeight: 600,
                        cursor: eliminando ? "not-allowed" : "pointer", marginRight: 8
                      }}
                    >
                      Eliminar
                    </button>
                    <button
                      className="remove"
                      style={{
                        background: '#f59e42', color: '#fff', border: 'none',
                        borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer'
                      }}
                      onClick={() => { setClienteGestionar(cliente); setModalMotivoOpen(true); }}
                    >
                      Marcar gestión
                    </button>
                  </td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#64748b", padding: 24 }}>
                    No hay clientes con estado "a_eliminar".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Modal para seleccionar motivo de gestión */}
        <ModalSeleccionMotivo
          open={modalMotivoOpen}
          onClose={() => setModalMotivoOpen(false)}
          onSave={handleGuardarMotivo}
        />
      </div>
    );
  }

  // Vista simple para otros estados
  return <div>Implementar vista para otros estados aquí</div>;
}
