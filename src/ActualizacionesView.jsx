import React from "react";
import useActualizaciones from "./useActualizaciones";

function ActualizacionesView() {
  const { datos, loading, error } = useActualizaciones();
  const usuarioId = localStorage.getItem("userId");
  console.log("usuarioId:", usuarioId);
  console.log("datos recibidos:", datos);

  if (loading) return <div>Cargando...<br />usuarioId actual: <b>{usuarioId}</b></div>;
  if (error) return <div>Error: {error}<br />usuarioId actual: <b>{usuarioId}</b></div>;
  if (!datos || datos.length === 0) return <div>No hay actualizaciones para este usuario.<br />usuarioId actual: <b>{usuarioId}</b></div>;

  // Tabla explícita con campos principales
  return (
    <div>
      <div style={{marginBottom:8, fontSize:14, color:'#1976d2'}}>
        <b>usuarioId actual:</b> {usuarioId}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Nombre del Cliente</th>
            <th>Celular</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((row) => (
            <tr key={row.id}>
              <td>{row.nombre_cliente}</td>
              <td>{row.celular}</td>
              <td>{row.status ? row.status : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ActualizacionesView;
