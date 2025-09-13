import React, { useState } from "react";
import "./ClientesNuevos.css";
import useClientesNuevos from "./useClientesNuevos";

const actualizarStatus = async (identidad, nuevoStatus) => {
  const url = `https://script.google.com/macros/s/AKfycbybKQScf_PZaGm0_OZKsKgw4RVZirPsS2iC-qc3OSuLL0duwFd8_HjycLbWaPMZTbnP/exec?identidad=${identidad}&status=${nuevoStatus}`;

  try {
    const response = await fetch(url, { method: "GET" });
    const data = await response.json();
  } catch (error) {
    console.error("Error al actualizar status:", error);
  }
};


const ClientesNuevos = () => {
  const [detalle, setDetalle] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const { clientes, loading, error } = useClientesNuevos();

  const handleRowClick = (cliente) => {
    setDetalle(cliente);
  };

  const closeDetalle = () => {
    setDetalle(null);
  };

  const handleActualizarStatus = async (nuevoStatus) => {
    if (detalle) {
      await actualizarStatus(detalle["No. de Identidad"], nuevoStatus);
      alert("Estatus actualizado correctamente");
      closeDetalle();
    }
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    if (filtro === "tomados" && cliente.STATUS !== "Tomado") return false;
    if (filtro === "sin-tomar" && cliente.STATUS === "Tomado") return false;
    if (
      busqueda &&
      !(
        cliente.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente["No. de Identidad"]
          ?.toLowerCase()
          .includes(busqueda.toLowerCase())
      )
    )
      return false;
    return true;
  });

  if (loading) {
    return <div className="modal-carga"><div className="contenido-carga"><p>Cargando...</p></div></div>;
  }
  if (error) {
    return <div className="modal-carga"><div className="contenido-carga"><p>Error: {error}</p></div></div>;
  }
  return (
    <div className="clientes-nuevos-container">
      <h2>Clientes Nuevos</h2>
      <div style={{width: '100%', maxWidth: 1200}}>
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16}}>
          <button
            onClick={() => setFiltro("todos")}
            className={filtro === "todos" ? "clientes-nuevos-status" : ""}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro("tomados")}
            className={filtro === "tomados" ? "clientes-nuevos-status" : ""}
          >
            Tomados
          </button>
          <button
            onClick={() => setFiltro("sin-tomar")}
            className={filtro === "sin-tomar" ? "clientes-nuevos-status" : ""}
          >
            Sin Tomar
          </button>
          <input
            type="text"
            placeholder="Buscar por nombre o No. de Identidad"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-bar"
            style={{flex: 1, minWidth: 220}}
          />
        </div>
        <div className="clientes-nuevos-table-wrapper">
          <table className="clientes-nuevos-tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>No. de Identidad</th>
                <th>Celular</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
            {clientesFiltrados.map((cliente, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(cliente)}
                style={{cursor: 'pointer'}}
              >
                <td data-label="Nombre">{cliente.Nombre}</td>
                <td data-label="No. de Identidad">{cliente["No. de Identidad"]}</td>
                <td data-label="Celular">{cliente.Celular}</td>
                <td data-label="Estatus">
                  <span
                    className={
                      cliente.STATUS === "Tomado"
                        ? "status-tomado"
                        : "status-sin-tomar"
                    }
                  >
                    {cliente.STATUS === "Tomado" ? "Tomado" : "Sin tomar"}
                  </span>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
      {detalle && (
        <div
          className="detalle-modal"
          onClick={e => {
            if (e.target.classList.contains('detalle-modal')) closeDetalle();
          }}
        >
          <div className="detalle-contenido">
           
            <h2>Detalle del Cliente</h2>
            <div className="detalle-lineas">
              {Object.entries(detalle).map(([key, value]) => (
                <div className="detalle-linea" key={key}>
                  <strong>{key}:</strong> {value}
                </div>
              ))}
            </div>
            <div className="actualizar-status">
              <button onClick={() => handleActualizarStatus("Tomado")}>Marcar como Tomado</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesNuevos;
