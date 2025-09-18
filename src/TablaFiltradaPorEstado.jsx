
import React, { useState, useEffect } from "react";
import ModalSeleccionMotivo from "./ModalSeleccionMotivo";
import useGestion from "./useGestion";

export default function TablaFiltradaPorEstado({ estado }) {
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false);
  const [clienteGestionar, setClienteGestionar] = useState(null);
  const [update, setUpdate] = useState(0);
  const { datos, loading, error } = useGestion(update);

  // Filtrar por estado, usuario y tienda ya lo hace useGestion
  const filas = datos.filter(
    (c) => (c.estado || "").toLowerCase() === estado.toLowerCase()
  );

  // Lógica para guardar motivo
  const handleGuardarMotivo = async (motivo) => {
    setModalMotivoOpen(false);
    setUpdate(Date.now());
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: "0 8px" }}>
      <button
        onClick={() => window.history.back()}
        style={{
          marginBottom: 24,
          background: "linear-gradient(90deg,#6366f1 0%,#818cf8 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 28px",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 1,
          cursor: "pointer",
          boxShadow: "0 2px 8px 0 rgba(80,80,120,0.10)",
          transition: "background 0.2s, box-shadow 0.2s",
          outline: "none",
          display: "inline-block",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#6366f1")}
        onMouseOut={(e) =>
          (e.currentTarget.style.background =
            "linear-gradient(90deg,#6366f1 0%,#818cf8 100%)")
        }
      >
        ← Regresar
      </button>
      <h2
        style={{
          marginBottom: 24,
          marginTop: 0,
          fontWeight: 800,
          letterSpacing: 1.2,
          color: "#3730a3",
          fontSize: 28,
          textAlign: "center",
          textTransform: "capitalize",
        }}
      >
        Clientes {estado.replace("_", " ")}
      </h2>
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
            {filas.map((cliente) => (
              <tr key={cliente.ID || cliente.id}>
                <td>{cliente.ID || cliente.id}</td>
                <td>{cliente.NOMBRES || cliente.nombre}</td>
                <td>{cliente.APELLIDOS || cliente.apellido}</td>
                <td>{cliente.TELEFONO || cliente.tel}</td>
                <td>{cliente.TIENDA || cliente.tienda}</td>
                <td>
                  <button
                    className="remove"
                    style={{
                      background: "#f59e42",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 12px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setClienteGestionar(cliente);
                      setModalMotivoOpen(true);
                    }}
                  >
                    Marcar gestión
                  </button>
                </td>
              </tr>
            ))}
            {filas.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "#64748b", padding: 24 }}>
                  No hay clientes con estado "{estado}".
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
