import React, { useEffect, useState } from "react";
import "./ClientesNuevos.css";
import Papa from "papaparse";
import { supabase } from "./supabaseClient";

const Actualizaciones = () => {
  const [clientes, setClientes] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUsuarioId(data.user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    setCargando(true);
    const fetchData = async () => {
      const sheetId = "1MmVZkubwhL4goX3wptmRZGvMFJtRBhJnb2TEwVwUNbk";
      const apiKey = "AIzaSyCIUJIvnSyAxU4NEp2lotm-QodOKQ0FqFA";
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/ACT?key=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.values) {
          const headers = data.values[0];
          const rows = data.values.slice(1);
          const formattedData = rows.map((row) => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || "";
            });
            return obj;
          });
          setClientes(formattedData);
        } else {
          console.error("No se encontraron datos en la hoja ACT.");
        }
      } catch (error) {
        console.error("Error al cargar los datos de Google Sheets:", error);
      }
      // Esperar 2 segundos antes de quitar el cargando
      setTimeout(() => setCargando(false), 2000);
    };
    fetchData();
  }, []);

  const handleRowClick = (cliente) => {
    setDetalle(cliente);
  };

  const closeDetalle = () => {
    setDetalle(null);
  };

  const clientesFiltrados = clientes.filter((cliente) => {
    // Filtrar por usuario si existe el campo y el usuarioId
    if (usuarioId && cliente.usuario && cliente.usuario !== usuarioId) return false;
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



  if (cargando) {
    return (
      <div className="modal-carga">
        <div className="contenido-carga">
          <p>Cargando...</p>
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
