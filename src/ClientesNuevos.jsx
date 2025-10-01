import React, { useState } from "react";
import { eliminarSolicitudSupabase } from "./supabaseDeleteSolicitud";
import "./ClientesNuevos.css";
import useClientesNuevosSupabase from "./useClientesNuevosSupabase";
import ModalExito from "./ModalExito";
import SolicitudModal from "./SolicitudModal";

const actualizarStatus = async (identidad, nuevoStatus) => {
  // Ya no se usa Google Sheets, se actualiza en Supabase
  // Esta función queda obsoleta, la lógica se mueve a handleActualizarStatus
};


const ClientesNuevos = () => {
  // Botón para recargar la tabla
  const handleRecargarTabla = () => {
    if (typeof refetch === 'function') {
      refetch();
    }
  };
  const [detalle, setDetalle] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [exito, setExito] = useState(false);
  const { clientes, loading, error, refetch } = useClientesNuevosSupabase();

  const handleRowClick = (cliente) => {
    setDetalle(cliente);
  };

  const closeDetalle = () => {
    setDetalle(null);
  };

  const handleActualizarStatus = async (nuevoStatus) => {
    if (detalle) {
      try {
        const idSupabase = detalle.id;
        if (!idSupabase) {
          alert("Error: ID único inválido para actualizar STATUS.");
          return;
        }
        // Importar la función
        const { actualizarStatusSupabase } = await import("./supabaseUpdateSolicitud.js");
        await actualizarStatusSupabase(idSupabase, nuevoStatus);
        setExito(true);
        if (typeof refetch === 'function') {
          setTimeout(() => {
            refetch();
          }, 500);
        }
        closeDetalle();
      } catch (err) {
        alert("Error al actualizar STATUS: " + err.message);
      }
    }
  };

  const handleEliminarSolicitud = async () => {
    if (detalle) {
      try {
        const idSupabase = detalle.id;
        if (!idSupabase) {
          alert("Error: ID único inválido para eliminar.");
          return;
        }
        await eliminarSolicitudSupabase(idSupabase);
        setExito(true);
        if (typeof refetch === 'function') {
          setTimeout(() => {
            refetch();
          }, 500);
        }
        closeDetalle();
      } catch (err) {
        alert("Error al eliminar: " + err.message);
      }
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
      {exito && (
        <ModalExito mensaje="Actualización exitosa" onClose={() => setExito(false)} />
      )}
      <h2>Clientes Nuevos</h2>
      <div style={{width: '100%', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {/* Botón recargar tabla */}
        <div style={{width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: 8}}>
          <button onClick={handleRecargarTabla} style={{padding: '8px 18px', borderRadius: '8px', background: '#1a73e8', color: '#fff', fontWeight: '600', border: 'none', cursor: 'pointer'}}>Recargar tabla</button>
        </div>
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
                <th>Fecha creada</th>
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
                <td data-label="Fecha creada">{cliente.created_at ? new Date(cliente.created_at).toLocaleDateString() : ''}</td>
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
        <SolicitudModal
          detalle={detalle}
          onClose={closeDetalle}
          onActualizarStatus={handleActualizarStatus}
          onEliminarSolicitud={handleEliminarSolicitud}
        />
      )}
    </div>
  );
};

export default ClientesNuevos;
