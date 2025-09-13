import React, { useState } from "react";
import "./Actualizaciones.css";
import useActualizaciones from "./useActualizaciones";

const Actualizaciones = () => {
  const [detalle, setDetalle] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const { datos: clientes, loading, error } = useActualizaciones();

  const handleRowClick = (cliente) => {
    setDetalle(cliente);
  };

  const closeDetalle = () => {
    setDetalle(null);
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    const nombre = cliente["Nombre del Cliente"]?.toLowerCase() || "";
    const numeroIdentidad = cliente["Número de Identidad"]?.toLowerCase() || "";
    const busquedaLower = busqueda.toLowerCase();
    if (filtro === "tomados" && cliente.STATUS !== "Tomado") return false;
    if (filtro === "sin-tomar" && cliente.STATUS === "Tomado") return false;
    if (
      busqueda &&
      !(
        nombre.includes(busquedaLower) ||
        numeroIdentidad.includes(busquedaLower)
      )
    ) {
      return false;
    }
    return true;
  });

  const actualizarStatus = async (numeroIdentidad, status) => {
    if (!numeroIdentidad || !status) {
      alert("Faltan parámetros: numeroIdentidad o status");
      return;
    }

    setCargando(true);
    const url = `https://script.google.com/macros/s/AKfycbxo9-Ofc9v5LobRNm1-q_mWeouXhfyp2RQxWSaG4jnO-eJ_mS4O4Btp0JUxTPR4FyOo/exec?numeroIdentidad=${encodeURIComponent(
      numeroIdentidad
    )}&status=${encodeURIComponent(status)}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      alert(data.message);
      setDetalle(null); // Cerrar el modal de detalle
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el status");
    } finally {
      setCargando(false);
    }
  };



  if (loading) {
    return (
      <div className="modal-carga">
        <div className="contenido-carga">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="modal-carga">
        <div className="contenido-carga">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="actualizaciones-container">
      <h2>Actualizaciones</h2>
      <div style={{width: '100%', maxWidth: 1200}}>
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16}}>
          <button
            onClick={() => setFiltro("todos")}
            className={filtro === "todos" ? "actualizaciones-status" : ""}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro("tomados")}
            className={filtro === "tomados" ? "actualizaciones-status" : ""}
          >
            Tomados
          </button>
          <button
            onClick={() => setFiltro("sin-tomar")}
            className={filtro === "sin-tomar" ? "actualizaciones-status" : ""}
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
        <div className="actualizaciones-table-wrapper">
          <table className="actualizaciones-table">
            <thead>
              <tr>
                <th>Nombre del Cliente</th>
                <th>Celular</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
            {clientesFiltrados.map((cliente, index) => (
              <tr
                key={index}
                onClick={() => handleRowClick(cliente)}
                style={{cursor: 'pointer'}}
              >
                <td data-label="Nombre del Cliente">{cliente["Nombre del Cliente"]}</td>
                <td data-label="Celular">{cliente.Celular}</td>
                <td data-label="STATUS">
                  <span
                    className={
                      cliente.STATUS === "Tomado"
                        ? "actualizaciones-status tomado"
                        : "actualizaciones-status"
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
            <button className="cerrar-detalle" onClick={closeDetalle}>
              Cerrar
            </button>
            <h2>Detalle del Cliente</h2>
            <div className="detalle-lineas">
              {Object.entries(detalle)
                .filter(([key]) => key.toLowerCase() !== 'usuario')
                .map(([key, value]) => (
                  <div className="detalle-linea" key={key}>
                    <strong>{key}:</strong> {value}
                  </div>
                ))}
            </div>
            <button
              onClick={() =>
                actualizarStatus(detalle["Número de Identidad"], "Tomado")
              }
              className="actualizaciones-status"
              style={{marginTop: 12}}
            >
              Actualizar a Tomado
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Actualizaciones;
