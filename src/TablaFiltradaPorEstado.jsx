
import React, { useState, useRef } from "react";
import TablaDesktop from "./TablaDesktop";
  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  // Copiar al portapapeles
  const copyToClipboard = (text, e) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        if (e && e.target) {
          e.target.innerHTML = "✔";
          setTimeout(() => {
            e.target.innerHTML = "📋";
          }, 1500);
        }
      });
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        if (e && e.target) {
          e.target.innerHTML = "✔";
          setTimeout(() => {
            e.target.innerHTML = "📋";
          }, 1500);
        }
      } catch {}
    }
  };
import { useNavigate } from "react-router-dom";
import useGestion from "./useGestion";
import ModalSeleccionMotivo from "./ModalSeleccionMotivo";
import GestionLinkModal from "./GestionLinkModal";


export default function TablaFiltradaPorEstado({ estado }) {

  const { datos, loading, error } = useGestion();
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false);
  const [clienteGestionar, setClienteGestionar] = useState(null);
  const [modalLinkOpen, setModalLinkOpen] = useState(false);
  const [linkCliente, setLinkCliente] = useState(null);
  const [mensajeBase] = useState(() => localStorage.getItem("mensajeBase") || "Hola 😇 {NOMBRE}");
  const mensajeRef = useRef();
  const navigate = useNavigate();

  // Acciones
  const enviarWhatsApp = (cliente) => {
    const texto = encodeURIComponent(
      mensajeBase.replace("{NOMBRE}", cliente.NOMBRES || cliente.nombre)
    );
    const url = `https://wa.me/504${cliente.TELEFONO || cliente.tel}?text=${texto}`;
    window.open(url, "_blank");
  };

  // Filtrar solo por estado
  const filas = datos.filter(c => {
    const estadoCliente = (c.estado || '').toLowerCase().trim();
    return estadoCliente === estado;
  });

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (filas.length === 0) return <div>No hay registros para mostrar.</div>;

  // Estilos para cards y botón regresar
  const cardStyle = {
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 4px 16px 0 rgba(80,80,120,0.10), 0 1.5px 4px 0 rgba(80,80,120,0.08)',
    padding: '20px 24px',
    margin: '18px auto',
    maxWidth: 420,
    transition: 'box-shadow 0.2s',
    border: '1.5px solid #e5e7eb',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  };
  const cardHover = {
    boxShadow: '0 8px 32px 0 rgba(80,80,120,0.18), 0 3px 8px 0 rgba(80,80,120,0.12)',
    borderColor: '#a5b4fc'
  };
  const regresarStyle = {
    marginBottom: 24,
    background: 'linear-gradient(90deg,#6366f1 0%,#818cf8 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '10px 28px',
    fontWeight: 700,
    fontSize: 18,
    letterSpacing: 1,
    cursor: 'pointer',
    boxShadow: '0 2px 8px 0 rgba(80,80,120,0.10)',
    transition: 'background 0.2s, box-shadow 0.2s',
    outline: 'none',
    display: 'inline-block'
  };

  return (
    <div style={{padding:'0 8px'}}>
      <button onClick={() => navigate(-1)} style={regresarStyle} onMouseOver={e=>e.currentTarget.style.background='#6366f1'} onMouseOut={e=>e.currentTarget.style.background='linear-gradient(90deg,#6366f1 0%,#818cf8 100%)'}>
        ← Regresar
      </button>
      <h2 style={{marginBottom:24,marginTop:0,fontWeight:800,letterSpacing:1.2,color:'#3730a3',fontSize:28,textAlign:'center',textTransform:'capitalize'}}>Filas con estado: {estado.replace('_',' ')}</h2>
      {isMobile ? (
        <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
          {filas.map(cliente => (
            <div key={cliente.ID || cliente.id} style={cardStyle} onMouseOver={e=>Object.assign(e.currentTarget.style,cardHover)} onMouseOut={e=>Object.assign(e.currentTarget.style,cardStyle)}>
              <div style={{fontWeight:700,fontSize:20,color:'#3730a3',marginBottom:4,display:'flex',alignItems:'center',gap:8}}>
                {cliente.NOMBRES || cliente.nombre} {cliente.APELLIDOS || cliente.apellido}
                <span
                  title="Copiar ID"
                  style={{cursor:'pointer',fontSize:18,marginLeft:6,verticalAlign:'middle'}}
                  onClick={e => copyToClipboard(cliente.ID || cliente.id, e)}
                  role="button"
                >📋</span>
              </div>
              <div style={{fontSize:15,color:'#64748b',marginBottom:2}}>
                ID: {cliente.ID || cliente.id}
              </div>
              <div style={{fontSize:15,color:'#64748b',marginBottom:2,display:'flex',alignItems:'center',gap:6}}>
                Teléfono: {cliente.TELEFONO || cliente.tel}
                <a
                  href={`tel:${cliente.TELEFONO || cliente.tel}`}
                  title="Llamar"
                  style={{color:'#25D366',fontWeight:'bold',textDecoration:'none',fontSize:'1.25em',marginLeft:6,verticalAlign:'middle'}}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📞
                </a>
              </div>
              <div style={{fontSize:15,color:'#64748b',marginBottom:2}}>Tienda: {cliente.TIENDA || cliente.tienda}</div>
              <div style={{fontSize:15,color:'#64748b',marginBottom:8}}>Actualizado: {cliente.updated_at}</div>
              <div style={{display:'flex',gap:8,marginTop:8,justifyContent:'center'}}>
                <button onClick={() => enviarWhatsApp(cliente)} style={{background:'#25D366',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',fontWeight:600,cursor:'pointer'}}>WhatsApp</button>
                <button style={{background:'#007bff',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',fontWeight:600,cursor:'pointer'}} onClick={() => { setLinkCliente(cliente); setModalLinkOpen(true); }}>Link</button>
                <button className="remove" style={{background:'#f59e42',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px',fontWeight:600,cursor:'pointer'}} onClick={() => { setClienteGestionar(cliente); setModalMotivoOpen(true); }}>Marcar gestión</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TablaDesktop
          filas={filas}
          onWhatsApp={enviarWhatsApp}
          onLink={cliente => { setLinkCliente(cliente); setModalLinkOpen(true); }}
          onMarcarGestion={cliente => { setClienteGestionar(cliente); setModalMotivoOpen(true); }}
          copyToClipboard={copyToClipboard}
        />
      )}
      {/* Modal para enviar link por WhatsApp */}
      <GestionLinkModal
        open={modalLinkOpen}
        onClose={() => setModalLinkOpen(false)}
        usuarioId={clienteGestionar?.usuario}
        telefono={(linkCliente?.TELEFONO || linkCliente?.tel || "").replace(/[^\d]/g, "")}
      />
      {/* Modal para seleccionar motivo de gestión */}
      <ModalSeleccionMotivo
        open={modalMotivoOpen}
        onClose={() => setModalMotivoOpen(false)}
        onSelect={async motivo => {
          // Aquí deberías replicar la lógica de actualización de estado de la vista Gestión
          setModalMotivoOpen(false);
        }}
      />
    </div>
  );
}
