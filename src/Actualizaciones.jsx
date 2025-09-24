import React, { useState } from "react";
import "./Actualizaciones.css";
import useActualizaciones from "./useActualizaciones";
import { createClient } from '@supabase/supabase-js';

// Cliente exclusivo para actualizacion_datos
const actualizacionesUrl = 'https://ydowdpcladycccauvmob.supabase.co';
const actualizacionesKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkb3dkcGNsYWR5Y2NjYXV2bW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTgxMTksImV4cCI6MjA3NDIzNDExOX0.W9FLueZVyuPXmEg7cx4qs4qWf8QspvdeO9Q9k97UALM';
const supabaseActualizaciones = createClient(actualizacionesUrl, actualizacionesKey);
import ModalExito from "./ModalExito";

function ModalError({ mensaje, onClose }) {
  return (
    <div className="modal-carga" style={{zIndex:3000}}>
      <div className="contenido-carga" style={{background:'#fff',borderRadius:12,padding:24,minWidth:260,boxShadow:'0 2px 12px #0002'}}>
        <p style={{color:'#d32f2f',fontWeight:600}}>{mensaje}</p>
        <button onClick={onClose} style={{marginTop:12,padding:'8px 18px',background:'#d32f2f',color:'#fff',border:'none',borderRadius:6,fontWeight:600}}>Cerrar</button>
      </div>
    </div>
  );
}

const Actualizaciones = () => {
  const [detalle, setDetalle] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const { datos: clientes, loading, error, refetch } = useActualizaciones();

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

  const actualizarStatus = async (id, status) => {
    if (!id || !status) {
      setErrorModal("Faltan parámetros: id o status");
      return;
    }
    setCargando(true);
    try {
      // Actualizar el status en Supabase por id
      const { error } = await supabaseActualizaciones
        .from('actualizacion_datos')
        .update({ status })
        .eq('id', id);
      if (!error) {
        setExito(true);
        if (typeof refetch === 'function') {
          setTimeout(() => {
            refetch();
          }, 500);
        }
      } else {
        setErrorModal('Error al actualizar el status: ' + error.message);
      }
      setDetalle(null);
    } catch (error) {
      console.error(error);
      setErrorModal("Error al actualizar el status");
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
      {exito && (
        <ModalExito mensaje="Actualización exitosa" onClose={() => setExito(false)} />
      )}
      {errorModal && (
        <ModalError mensaje={errorModal} onClose={() => setErrorModal("")} />
      )}
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
          <button
            onClick={() => refetch && refetch()}
            style={{background:'#1976d2',color:'#fff',border:'none',borderRadius:6,padding:'8px 18px',fontWeight:600}}
          >
            Recargar tabla
          </button>
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
                <td data-label="Nombre del Cliente">{cliente.nombre_cliente}</td>
                <td data-label="Celular">{cliente.celular}</td>
                <td data-label="STATUS">
                  <span
                    className={
                      cliente.status === "Tomado"
                        ? "actualizaciones-status tomado"
                        : "actualizaciones-status"
                    }
                  >
                    {cliente.status === "Tomado" ? "Tomado" : "Sin tomar"}
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
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}
        >
          <div className="detalle-contenido" style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 24px #0002',
            padding: '32px 24px 24px 24px',
            minWidth: 320,
            maxWidth: 420,
            width: '100%',
            position: 'relative',
            animation: 'fadeIn .3s'
          }}>
            <button className="cerrar-detalle" onClick={closeDetalle} style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'none',
              border: 'none',
              fontSize: 22,
              color: '#888',
              cursor: 'pointer',
              fontWeight: 'bold'
            }} title="Cerrar">×</button>
            <h2 style={{textAlign:'center',marginBottom:18,letterSpacing:1,fontWeight:600}}>Detalle del Cliente</h2>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {Object.entries(detalle)
                .filter(([key]) => {
                  const k = key.toLowerCase();
                  return k !== 'usuario' && k !== 'id' && k !== 'usuario_id';
                })
                .map(([key, value]) => (
                  <div key={key} style={{
                    background:'#f7f7f7',
                    borderRadius:8,
                    padding:'10px 14px',
                    boxShadow:'0 1px 4px #0001',
                    display:'flex',
                    flexDirection:'column',
                    fontSize:15
                  }}>
                    <span style={{color:'#1976d2',fontWeight:500,marginBottom:2}}>{key.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span style={{color:'#222'}}>{value}</span>
                  </div>
                ))}
            </div>
            <button
              onClick={() =>
                actualizarStatus(detalle.id, "Tomado")
              }
              className="actualizaciones-status"
              style={{marginTop: 24, width:'100%',padding:'10px 0',fontSize:16,borderRadius:8,background:'#1976d2',color:'#fff',border:'none',fontWeight:600,cursor:'pointer'}}
            >
              Actualizar a Tomado
            </button>
            <button
              onClick={async () => {
                try {
                  const { error } = await supabaseActualizaciones
                    .from('actualizacion_datos')
                    .delete()
                    .eq('id', detalle.id);
                  if (!error) {
                    setDetalle(null);
                    if (typeof refetch === 'function') refetch();
                  } else {
                    setErrorModal('Error al eliminar: ' + error.message);
                  }
                } catch (err) {
                  setErrorModal('Error al eliminar');
                }
              }}
              style={{marginTop: 12, width:'100%',padding:'10px 0',fontSize:16,borderRadius:8,background:'#d32f2f',color:'#fff',border:'none',fontWeight:600,cursor:'pointer'}}
            >
              Eliminar cliente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Actualizaciones;
