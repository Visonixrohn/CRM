import React, { useEffect, useState, useRef } from "react";
import ModalSeleccionMotivo from "./ModalSeleccionMotivo";
import ModalGestionarGestion from "./ModalGestionarGestion";
import "./Gestion.css";
import "./GestionCard.css";
import GestionLinkModal from "./GestionLinkModal";
import GestionLinkModalMobile from "./GestionLinkModalMobile";
import useGestion from "./useGestion";

// Componente Card para móviles
const GestionCard = ({ cliente, onWhatsApp, onQuitar, onLink }) => (
  <div className="gestion-card-mobile">
    <div className="analisis-card">
      <div className="analisis-card-title" style={{fontWeight:'bold',color:'#3730a3'}}>
        {cliente.NOMBRES || cliente.nombre} {cliente.APELLIDOS || cliente.apellido}
      </div>
      <div className="analisis-card-value" style={{fontSize:'0.98rem',color:'#64748b',marginBottom:4}}>
        ID: {String(cliente.ID || cliente.id).length === 12
          ? '0' + String(cliente.ID || cliente.id)
          : cliente.ID || cliente.id}
      </div>
      <div className="analisis-card-value" style={{fontSize:'0.98rem',color:'#64748b',marginBottom:4}}>
        Tienda: {cliente.TIENDA || cliente.tienda}
      </div>
      <div className="analisis-card-value" style={{fontSize:'0.98rem',color:'#64748b',marginBottom:4}}>
        Segmento: {cliente.SEGMENTO || cliente.segmento}
      </div>
      <div className="analisis-card-value" style={{fontSize:'0.98rem',color:'#64748b',marginBottom:8,display:'flex',alignItems:'center',gap:6}}>
        <span>📞</span>
        <a href={`tel:${cliente.TELEFONO || cliente.tel}`} style={{color:'#25D366',fontWeight:'bold',textDecoration:'none',fontSize:'1.08em'}}>{cliente.TELEFONO || cliente.tel}</a>
        {(cliente.TELEFONO || cliente.tel) && (
          <a
            href={`https://web.whatsapp.com/send?phone=504${(cliente.TELEFONO || cliente.tel).replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chatear por WhatsApp"
            style={{ marginLeft: 8, color: '#25D366', fontSize: '1.2em', verticalAlign: 'middle', textDecoration: 'none' }}
            onClick={ev => ev.stopPropagation()}
          >
            <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" style={{verticalAlign:'middle'}}>
              <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.824-2.05C13.41 27.633 14.686 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.13 0-2.238-.188-3.287-.558l-.235-.08-4.646 1.217 1.24-4.527-.153-.236C7.188 19.238 7 18.13 7 17c0-4.963 4.037-9 9-9s9 4.037 9 9-4.037 9-9 9zm5.29-6.709c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.02-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.08-1.28-.77-.68-1.29-1.52-1.44-1.78-.15-.26-.02-.4.11-.53.11-.11.26-.29.39-.44.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.21-.51-.43-.44-.58-.45-.15-.01-.32-.01-.5-.01-.17 0-.45.06-.68.28-.23.22-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.81 2.77 4.39 3.78.61.21 1.09.33 1.46.42.61.13 1.16.11 1.6.07.49-.05 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3z"/>
            </svg>
          </a>
        )}
      </div>
      <div style={{display:'flex',gap:8,marginTop:8,justifyContent:'center'}}>
        <button onClick={() => onWhatsApp(cliente)} style={{background:'#25D366',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px'}}>WhatsApp</button>
        <button onClick={() => onQuitar(cliente)} className="remove">Marcar gestion</button>
        <button onClick={() => onLink(cliente)} style={{background:'#007bff',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px'}}>Link</button>
       
      </div>
    </div>
  </div>
);

const MENSAJE_DEFAULT = `Hola 😇 {NOMBRE}`;

import { useEffect as useEffectApp, useState as useStateApp } from "react";
import { supabase } from "./supabaseClient";
  // Eliminar cliente de Supabase y de la lista local
  const eliminarClienteSupabase = async (cliente) => {
    if (!cliente || !cliente.id && !cliente.ID) return;
    const id = cliente.ID || cliente.id;
    const { error } = await supabase.from('gestion').delete().eq('no_identificacion', id);
    if (!error) {
      setAEliminar(prev => prev.filter(c => (c.ID || c.id) !== id));
      // También refrescar datos si es necesario
      setUpdate(u => u + 1);
    } else {
      setError('Error al eliminar: ' + error.message);
    }
  };


const Gestion = () => {
  const [mensajeBase, setMensajeBase] = useState(() => localStorage.getItem("mensajeBase") || MENSAJE_DEFAULT);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalGestionarOpen, setModalGestionarOpen] = useState(false);
  const [clienteGestionar, setClienteGestionar] = useState(null);
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false);
  const [motivoGestion, setMotivoGestion] = useState("");
  const [noContestan, setNoContestan] = useState([]);
  const [noQuiere, setNoQuiere] = useState([]);
  // const [modalLista, setModalLista] = useState({ open: false, tipo: null });
  const [filtroEstado, setFiltroEstado] = useState(null); // 'no_contestan', 'no_quiere', 'si_quiere', 'a_eliminar', null
  const [aEliminar, setAEliminar] = useState([]);
  const [siQuiere, setSiQuiere] = useState([]);
  const [error, setError] = useState("");
  const [filtros, setFiltros] = useState(["", "", "", "", ""]);
  const [lastRemoved, setLastRemoved] = useState(null);
  const [update, setUpdate] = useState(0);
  const mensajeRef = useRef();
  const [userId, setUserId] = useState(null);
  const [modalLinkOpen, setModalLinkOpen] = useState(false);
  const [linkCliente, setLinkCliente] = useState(null);
  const { datos, loading, error: errorGestion, total, pendientes } = useGestion(update);

  // Actualización automática cada 15 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdate(u => u + 1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Obtener usuario actual desde localStorage
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) setUserId(userId);
  }, []);

  // Gestionados hoy
  const hoy = new Date().toLocaleDateString();
  const gestionados = JSON.parse(localStorage.getItem("gestionados") || "[]");
  const countGestionados = gestionados.filter((g) => g.fecha === hoy).length;

  // Filtrar clientes: solo mostrar los del usuario autenticado y aplicar filtros
  let clientesFiltrados = datos.filter((c) =>
    filtros.every((f, i) => {
      if (!f) return true;
      const val = [c.ID || c.id, c.NOMBRES || c.nombre, c.APELLIDOS || c.apellido, c.TELEFONO || c.tel, c.TIENDA || c.tienda][i] || "";
      return val.toLowerCase().includes(f.toLowerCase());
    })
  );
  if (filtroEstado === 'no_contestan') clientesFiltrados = datos.filter(c => (c.estado || '').toLowerCase() === 'no_contestan');
  else if (filtroEstado === 'no_quiere') clientesFiltrados = datos.filter(c => (c.estado || '').toLowerCase() === 'no_quiere');
  else if (filtroEstado === 'si_quiere') clientesFiltrados = datos.filter(c => (c.estado || '').toLowerCase() === 'si_quiere');
  else if (filtroEstado === 'a_eliminar') clientesFiltrados = datos.filter(c => (c.estado || '').toLowerCase() === 'a_eliminar');

  // Quitar cliente y guardar datos gestionados
  const quitarCliente = async (cliente, datosGestion = null) => {
    const nuevo = [...gestionados, { id: cliente.id, fecha: hoy }];
    localStorage.setItem("gestionados", JSON.stringify(nuevo));
    setLastRemoved({ id: cliente.id, fecha: hoy });
    setUpdate((u) => u + 1);
    if (datosGestion) {
      // Guardar en Supabase tabla seguimiento
      try {
        const { articulo, tipo, fecha } = datosGestion;
        const nombre = (cliente.NOMBRES || cliente.nombre || '') + ' ' + (cliente.APELLIDOS || cliente.apellido || '');
        const dni = cliente.ID || cliente.id || '';
        const { error: supaError } = await supabase.from('seguimiento').insert([
          {
            id_usuario: userId,
            nombre_cliente: nombre.trim(),
            dni: dni,
            cel: cliente.TELEFONO || cliente.tel,
            articulo,
            tipo,
            fecha_de_acuerdo: fecha,
            estado: 'Gestionado',
          }
        ]);
        if (supaError) setError('Error al guardar en Supabase: ' + supaError.message);
      } catch (err) {
        setError('Error inesperado al guardar en Supabase');
      }
    }
  };

  // Restaurar último quitado
  const restaurarCliente = () => {
    if (lastRemoved) {
      let nuevo = gestionados.filter(
        (g) => !(g.id === lastRemoved.id && g.fecha === lastRemoved.fecha)
      );
      localStorage.setItem("gestionados", JSON.stringify(nuevo));
      setLastRemoved(null);
      setUpdate((u) => u + 1);
    } else {
      setError("No hay filas para restaurar.");
    }
  };

  // Copiar al portapapeles
  const copyToClipboard = (text, e) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        e.target.innerHTML = "✔";
        setTimeout(() => {
          e.target.innerHTML = "📋";
        }, 2000);
      });
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        e.target.innerHTML = "✔";
        setTimeout(() => {
          e.target.innerHTML = "📋";
        }, 2000);
      } catch (err) {
        setError("Error al copiar el ID: Copia no soportada en este navegador.");
      }
    }
  };

  // Enviar WhatsApp
  const enviarWhatsApp = (cliente) => {
    const texto = encodeURIComponent(
      mensajeBase.replace("{NOMBRE}", cliente.nombre)
    );
    // Usar wa.me para abrir WhatsApp directamente en el teléfono
    const url = `https://wa.me/504${cliente.tel}?text=${texto}`;
    window.open(url, "_blank");
  };

  // Guardar mensaje
  const guardarMensaje = () => {
    setMensajeBase(mensajeRef.current.value);
    localStorage.setItem("mensajeBase", mensajeRef.current.value);
    setModalOpen(false);
  };

  // Filtros inputs
  const handleFiltro = (i, val) => {
    setFiltros((f) => {
      const nuevo = [...f];
      nuevo[i] = val;
      return nuevo;
    });
  };

  // Actualizar al quitar/restaurar
  useEffect(() => {
    // Forzar re-render al cambiar gestionados
  }, [update]);

  return (
    <div>
      <div className="cards" style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
        <div className="analisis-card" style={{flex:'1 1 120px',minWidth:120}}>
          <div className="analisis-card-title" style={{fontWeight:'bold',color:'#3730a3'}}>Total Clientes</div>
          <div className="analisis-card-value" style={{fontSize:'1.3rem',color:'#0f172a',fontWeight:'bold'}}>{total}</div>
        </div>
        <div className="analisis-card" style={{flex:'1 1 120px',minWidth:120}}>
          <div className="analisis-card-title" style={{fontWeight:'bold',color:'#3730a3'}}>Gestionados Hoy</div>
          <div className="analisis-card-value" style={{fontSize:'1.3rem',color:'#0f172a',fontWeight:'bold'}}>{countGestionados}</div>
        </div>
        <div className="analisis-card" style={{flex:'1 1 120px',minWidth:120}}>
          <div className="analisis-card-title" style={{fontWeight:'bold',color:'#3730a3'}}>Pendientes</div>
          <div className="analisis-card-value" style={{fontSize:'1.3rem',color:'#0f172a',fontWeight:'bold'}}>{pendientes}</div>
        </div>
      </div>
      {/* Cards de No contestan, No quiere, Sí quiere y A eliminar */}
      <div className="cards" style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
        <div className="analisis-card" style={{flex:'1 1 120px',minWidth:120,cursor:'pointer',background:'#fef3c7',boxShadow:filtroEstado==='no_contestan'? '0 0 0 2px #fbbf24':'none'}} onClick={()=>setFiltroEstado(filtroEstado==='no_contestan'?null:'no_contestan')}>
          <div className="analisis-card-title" style={{fontWeight:'bold',color:'#b45309'}}>No contestan</div>
          <div className="analisis-card-value" style={{fontSize:'1.3rem',color:'#b45309',fontWeight:'bold'}}>{datos.filter(c => (c.estado || '').toLowerCase() === 'no_contestan').length}</div>
        </div>
        <div className="analisis-card" style={{flex:'1 1 120px',minWidth:120,cursor:'pointer',background:'#fee2e2',boxShadow:filtroEstado==='no_quiere'? '0 0 0 2px #ef4444':'none'}} onClick={()=>setFiltroEstado(filtroEstado==='no_quiere'?null:'no_quiere')}>
          <div className="analisis-card-title" style={{fontWeight:'bold',color:'#b91c1c'}}>No quiere</div>
          <div className="analisis-card-value" style={{fontSize:'1.3rem',color:'#b91c1c',fontWeight:'bold'}}>{datos.filter(c => (c.estado || '').toLowerCase() === 'no_quiere').length}</div>
        </div>
        <div className="analisis-card" style={{flex:'1 1 120px',minWidth:120,cursor:'pointer',background:'#bbf7d0',boxShadow:filtroEstado==='si_quiere'? '0 0 0 2px #22c55e':'none'}} onClick={()=>setFiltroEstado(filtroEstado==='si_quiere'?null:'si_quiere')}>
          <div className="analisis-card-title" style={{fontWeight:'bold',color:'#15803d'}}>Sí quiere</div>
          <div className="analisis-card-value" style={{fontSize:'1.3rem',color:'#15803d',fontWeight:'bold'}}>{datos.filter(c => (c.estado || '').toLowerCase() === 'si_quiere').length}</div>
        </div>
        <div className="analisis-card" style={{flex:'1 1 120px',minWidth:120,cursor:'pointer',background:'#e0e7ef',boxShadow:filtroEstado==='a_eliminar'? '0 0 0 2px #334155':'none'}} onClick={()=>setFiltroEstado(filtroEstado==='a_eliminar'?null:'a_eliminar')}>
          <div className="analisis-card-title" style={{fontWeight:'bold',color:'#334155'}}>A eliminar</div>
          <div className="analisis-card-value" style={{fontSize:'1.3rem',color:'#334155',fontWeight:'bold'}}>{datos.filter(c => (c.estado || '').toLowerCase() === 'a_eliminar').length}</div>
        </div>
      </div>
      {/* Modal para mostrar lista de clientes */}

      <div className="filters">
        <button onClick={() => setModalOpen(true)}>Mensaje</button>
      </div>
      {/* Cards móviles */}
      {filtroEstado === 'a_eliminar' && aEliminar.length > 0 && (
        <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12,gap:8}}>
          <button
            onClick={async () => {
              if (!window.confirm('¿Eliminar TODOS los clientes de la lista y de Supabase?')) return;
              for (const cliente of aEliminar) {
                await eliminarClienteSupabase(cliente);
              }
            }}
            style={{background:'#ef4444',color:'#fff',border:'none',borderRadius:6,padding:'8px 18px',fontWeight:700,cursor:'pointer'}}
          >Eliminar todos</button>
        </div>
      )}
      {clientesFiltrados
        .filter((cliente) =>
          !gestionados.some((g) => g.id === (cliente.ID || cliente.id) && g.fecha === hoy)
        )
        .map((cliente) => (
          <div key={cliente.ID || cliente.id} style={{ position: 'relative' }}>
            {filtroEstado === 'a_eliminar' ? (
              <div style={{position:'relative',border:'1px solid #eee',borderRadius:8,padding:12,marginBottom:10,background:'#fff'}}>
                <div style={{fontWeight:600}}>{cliente.NOMBRES || cliente.nombre} {cliente.APELLIDOS || cliente.apellido}</div>
                <div style={{fontSize:13,color:'#666'}}>Tel: {cliente.TELEFONO || cliente.tel}</div>
                <button
                  onClick={() => eliminarClienteSupabase(cliente)}
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    zIndex: 10
                  }}
                >Eliminar</button>
              </div>
            ) : (
              <GestionCard
                cliente={{
                  ...cliente,
                  id: cliente.ID || cliente.id,
                  nombre: cliente.NOMBRES || cliente.nombre,
                  apellido: cliente.APELLIDOS || cliente.apellido,
                  tel: cliente.TELEFONO || cliente.tel,
                  tienda: cliente.TIENDA || cliente.tienda,
                  segmento: cliente.SEGMENTO || cliente.segmento
                }}
                onWhatsApp={enviarWhatsApp}
                onQuitar={(cliente) => {
                  setClienteGestionar(cliente);
                  setModalMotivoOpen(true);
                }}
                onLink={(c) => { setLinkCliente(c); setModalLinkOpen(true); }}
              />
            )}
          </div>
        ))}
      {/* Modal para enviar link por WhatsApp en móvil */}
      <GestionLinkModalMobile
        open={modalLinkOpen}
        onClose={() => setModalLinkOpen(false)}
        usuarioId={userId}
        telefono={(linkCliente?.TELEFONO || linkCliente?.tel || "").replace(/[^\d]/g, "")}
      />
      {/* Tabla solo visible en desktop por CSS */}
      <div className="table-container">
        <table id="clientesTable">
          <thead>
            <tr>
              <th>
                ID
                <br />
                <input
                  type="text"
                  value={filtros[0]}
                  onChange={(e) => handleFiltro(0, e.target.value)}
                />
              </th>
              <th>
                Nombres
                <br />
                <input
                  type="text"
                  value={filtros[1]}
                  onChange={(e) => handleFiltro(1, e.target.value)}
                />
              </th>
              <th>
                Apellidos
                <br />
                <input
                  type="text"
                  value={filtros[2]}
                  onChange={(e) => handleFiltro(2, e.target.value)}
                />
              </th>
              <th>
                Teléfono
                <br />
                <input
                  type="text"
                  value={filtros[3]}
                  onChange={(e) => handleFiltro(3, e.target.value)}
                />
              </th>
              <th>
                Tienda
                <br />
                <input
                  type="text"
                  value={filtros[4]}
                  onChange={(e) => handleFiltro(4, e.target.value)}
                />
              </th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados
              .filter((cliente) =>
                !gestionados.some((g) => g.id === (cliente.ID || cliente.id) && g.fecha === hoy)
              )
              .map((cliente) => (
                <tr key={cliente.ID || cliente.id}>
                  <td>
                    {String(cliente.ID || cliente.id).length === 12
                      ? '0' + String(cliente.ID || cliente.id)
                      : cliente.ID || cliente.id}
                    <span
                      className="copy-btn"
                      title="Copiar ID"
                      style={{ marginLeft: 5 }}
                      onClick={(e) => copyToClipboard(cliente.ID || cliente.id, e)}
                    >
                      📋
                    </span>
                  </td>
                  <td>{cliente.NOMBRES || cliente.nombre}</td>
                  <td>{cliente.APELLIDOS || cliente.apellido}</td>
                  <td>{cliente.TELEFONO || cliente.tel}</td>
                  <td>{cliente.TIENDA || cliente.tienda}</td>
                  <td>
                    <button onClick={() => enviarWhatsApp(cliente)}>
                      Enviar
                    </button>
                    <button style={{marginLeft:4,marginRight:4}} onClick={() => { setLinkCliente(cliente); setModalLinkOpen(true); }}>
                      Link
                    </button>
                    <button className="remove" onClick={() => {
                      setClienteGestionar(cliente);
                      setModalMotivoOpen(true);
                    }}>
                      Marcar gestion
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* Modal para mensaje */}
      {modalOpen && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <h3>Editar Mensaje</h3>
            <textarea ref={mensajeRef} defaultValue={mensajeBase} />
            <br />
            <br />
            <button onClick={guardarMensaje}>Guardar</button>
            <button onClick={() => setModalOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}
      {/* Modal para seleccionar motivo de gestión */}
      <ModalSeleccionMotivo
        open={modalMotivoOpen}
        onClose={() => setModalMotivoOpen(false)}
        onSelect={async motivo => {
          setMotivoGestion(motivo);
          // Actualizar estado en Supabase
          if (clienteGestionar) {
            const id = clienteGestionar.ID || clienteGestionar.id;
            const { error } = await supabase
              .from('gestion')
              .update({ estado: motivo })
              .eq('no_identificacion', id);
            if (error) setError('Error al actualizar estado: ' + error.message);
            setUpdate(u => u + 1); // Forzar recarga
          }
          setModalMotivoOpen(false);
          if (motivo === 'si_quiere') {
            setTimeout(() => setModalGestionarOpen(true), 200);
          }
        }}
      />
      {/* Modal para gestionar cliente */}
      <ModalGestionarGestion
        open={modalGestionarOpen}
        onClose={() => setModalGestionarOpen(false)}
        initialData={{
          articulo: clienteGestionar?.articulo || '',
          tipo: 'CONTADO',
          fecha: undefined
        }}
        onSave={(datos) => {
          if (clienteGestionar) {
            quitarCliente(clienteGestionar, datos);
          }
          setModalGestionarOpen(false);
        }}
      />
      {/* Mensaje de error */}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Gestion;
