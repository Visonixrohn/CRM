import React, { useState } from "react";
import "./ClientesNuevos.css";
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
    <div className="clientes-nuevos-container">
      <h1>Actualizaciones</h1>
      <div className="filtros-busqueda">
        <button
          onClick={() => setFiltro("todos")}
          className={filtro === "todos" ? "activo" : ""}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro("tomados")}
          className={filtro === "tomados" ? "activo" : ""}
        >
          Tomados
        </button>
        <button
          onClick={() => setFiltro("sin-tomar")}
          className={filtro === "sin-tomar" ? "activo" : ""}
        >
          Sin Tomar
        </button>
        <input
          type="text"
          placeholder="Buscar por nombre o No. de Identidad"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="barra-busqueda"
        />
      </div>
      <table className="clientes-nuevos-tabla">
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
              className={
                cliente.STATUS === "Tomado"
                  ? "status-tomado"
                  : "status-sin-tomar"
              }
            >
              <td>{cliente["Nombre del Cliente"]}</td>
              <td>{cliente.Celular}</td>
              <td>{cliente.STATUS}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {detalle && (
        <div className="detalle-modal">
          <div className="detalle-contenido">
            <button className="cerrar-detalle" onClick={closeDetalle}>
              Cerrar
            </button>
            <h2>Detalle del Cliente</h2>
            {Object.entries(detalle).map(([key, value]) => (
              <p key={key}>
                <strong>{key}:</strong> {value}
              </p>
            ))}
            <button
              onClick={() =>
                actualizarStatus(detalle["Número de Identidad"], "Tomado")
              }
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
