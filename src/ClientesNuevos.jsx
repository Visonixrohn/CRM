import React, { useEffect, useState } from "react";
import "./ClientesNuevos.css";
import Papa from "papaparse";
import { supabase } from "./supabaseClient";

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
  const [clientes, setClientes] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);
  const [cargando, setCargando] = useState(false);

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
      const response = await fetch(
        "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFX5eKDodVmbXf_U0DJNl5MgXrzZgCCgGbswtez88Gu4ywvLMoRIsBAd33vZ1rDEidXTO4zfcv3zWE/pub?output=csv"
      );
      const csvData = await response.text();
      Papa.parse(csvData, {
        header: true,
        complete: (result) => {
          setClientes(result.data);
        },
      });
      setTimeout(() => setCargando(false), 2000);
    };
    fetchData();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    // Filtrar por usuario si existe el campo y el usuarioId
    if (usuarioId && cliente.usuario && cliente.usuario !== usuarioId) return false;
    if (filtro === "tomados" && cliente.STATUS !== "Tomado") return false;
    if (filtro === "sin-tomar" && cliente.STATUS === "Tomado") return false;
    if (
      busqueda &&
      !(
        cliente.Nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        cliente["No. de Identidad"]?.toLowerCase().includes(busqueda.toLowerCase())
      )
    )
      return false;
    return true;
  });

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
      <h1>Clientes Nuevos</h1>
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
      <div className="tabla-container">
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
                className={
                  cliente.Estatus === "Tomado"
                    ? "status-tomado"
                    : "status-sin-tomar"
                }
              >
                <td>{cliente.Nombre}</td>
                <td>{cliente["No. de Identidad"]}</td>
                <td>{cliente.Celular}</td>
                <td>{cliente.STATUS}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
