import React, { useState } from "react";
import { eliminarSolicitudSupabase } from "./supabaseDeleteSolicitud";
import "./ClientesNuevos.css";
import useClientesNuevosSupabase from "./useClientesNuevosSupabase";
import ModalExito from "./ModalExito";

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
           
            <div style={{maxWidth:700,margin:'0 auto',background:'#fff',border:'1.5px solid #e5e7eb',borderRadius:12,padding:'32px 32px 24px 32px',boxShadow:'0 2px 16px #6366f122'}}>
              <h2 style={{textAlign:'center',fontWeight:800,fontSize:30,marginBottom:8,letterSpacing:1}}>
                Solicitud de empleo: {detalle?.Nombre || ''}
              </h2>
              <div style={{textAlign:'center',fontSize:16,marginBottom:24,color:'#555'}}></div>
              <table style={{width:'100%',borderCollapse:'collapse',background:'#fff',marginBottom:16}}>
                <tbody>
                  {Object.entries(detalle)
                    .filter(([key, value]) => {
                      const ocultar = [
                        "ref persona 1 tel casa",
                        "ref persona 2 tel casa",
                        "ref familiar 1 tel casa",
                        "ref familiar 2 tel casa",
                        "usuario"
                      ];
                      const normalizado = key.trim().toLowerCase().replace(/:$/, "");
                      // Ocultar campos vacíos o nulos
                      if (value === null || value === undefined || String(value).trim() === "") return false;
                      return !ocultar.includes(normalizado);
                    })
                    .map(([key, value]) => {
                      // Detectar si es campo de ubicación
                      const esUbicacion =
                        key.trim().toLowerCase() === "ubicación del domicilio" ||
                        key.trim().toLowerCase() === "ubicación del trabajo";
                      let urlMaps = null;
                      if (esUbicacion && value && typeof value === 'string' && value.trim().length > 0) {
                        urlMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
                      }
                      return (
                        <tr key={key} style={{borderBottom:'1px solid #e5e7eb'}}>
                          <td style={{fontWeight:'bold',padding:'10px 8px',color:'#222',width:'35%',verticalAlign:'top',background:'#f3f4f6'}}>{key}</td>
                          <td style={{padding:'10px 8px',fontSize:16}}>
                            {value}
                            {urlMaps && (
                              <a
                                href={urlMaps}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Ver en Google Maps"
                                style={{ marginLeft: 8, verticalAlign: 'middle', color: '#1976d2', fontSize: 18, display:'inline-block' }}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                              </a>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <div style={{marginTop:24,textAlign:'right',fontSize:15,color:'#555'}}>
               
              </div>
            </div>
            <div className="actualizar-status" style={{display:'flex',gap:12}}>
              <button onClick={() => handleActualizarStatus("Tomado")}>Marcar como Tomado</button>
              <button onClick={handleEliminarSolicitud} style={{background:'#e63946',color:'#fff'}}>Eliminar solicitud</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientesNuevos;
