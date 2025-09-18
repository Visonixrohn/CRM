import React, { useState } from "react";
import ModalSeleccionMotivo from "./ModalSeleccionMotivo";
import GestionLinkModalMobile from "./GestionLinkModalMobile";
import { supabase } from "./supabaseClient";

export default function CardsFiltradasPorEstado({ filas }) {
  // Botón de regresar para móvil
  const handleBack = () => {
    window.history.back();
  };
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false);
  const [clienteGestionar, setClienteGestionar] = useState(null);
  const [modalLinkOpen, setModalLinkOpen] = useState(false);
  const [linkCliente, setLinkCliente] = useState(null);
  const [update, setUpdate] = useState(0);

  // Función para enviar WhatsApp
  const enviarWhatsApp = (cliente) => {
    const mensajeBase = "Hola 😇 {NOMBRE}";
    const texto = encodeURIComponent(
      mensajeBase.replace("{NOMBRE}", cliente.NOMBRES || cliente.nombre || "")
    );
    const url = `https://wa.me/504${(cliente.TELEFONO || cliente.tel || "").replace(/[^\d]/g, "")}?text=${texto}`;
    window.open(url, "_blank");
  };

  // Guardar motivo y actualizar en supabase
  const handleGuardarMotivo = async (motivo) => {
    if (!clienteGestionar) {
      setModalMotivoOpen(false);
      return;
    }
    const id = clienteGestionar.ID || clienteGestionar.id;
    const now = new Date();
    const dia = String(now.getDate()).padStart(2, '0');
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const anio = now.getFullYear();
    const fechaTexto = `${dia}/${mes}/${anio}`;
    const usuarioActual = clienteGestionar.usuario || localStorage.getItem("userId");
    const { error } = await supabase
      .from('gestion')
      .update({ estado: motivo, updated_at: fechaTexto, usuario: usuarioActual })
      .eq('no_identificacion', id);
    if (error) {
      alert('Error al actualizar estado: ' + error.message);
    } else {
      setUpdate(Date.now());
    }
    setModalMotivoOpen(false);
  };

  return (
    <div className="cards-filtradas-estado-mobile">
      <button
        onClick={handleBack}
        style={{
          marginBottom: 18,
          background: "linear-gradient(90deg,#6366f1 0%,#818cf8 100%)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 28px",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: 1,
          cursor: "pointer",
          boxShadow: "0 2px 8px 0 rgba(80,80,120,0.10)",
          transition: "background 0.2s, box-shadow 0.2s",
          outline: "none",
          display: "inline-block",
        }}
        onMouseOver={e => (e.currentTarget.style.background = "#6366f1")}
        onMouseOut={e => (e.currentTarget.style.background = "linear-gradient(90deg,#6366f1 0%,#818cf8 100%)")}
      >
        ← Regresar
      </button>
      {filas.map((cliente) => (
        <div className="gestion-card-mobile" key={cliente.ID || cliente.id} style={{marginBottom:16}}>
          <div className="analisis-card">
            <div className="analisis-card-title" style={{fontWeight:'bold',color:'#3730a3'}}>
              {cliente.NOMBRES || cliente.nombre} {cliente.APELLIDOS || cliente.apellido}
            </div>
            <div className="analisis-card-value" style={{fontSize:'0.98rem',color:'#64748b',marginBottom:4}}>
              ID: {cliente.ID || cliente.id}
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
              <button onClick={() => enviarWhatsApp(cliente)} style={{background:'#25D366',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px'}}>WhatsApp</button>
              <button onClick={() => { setLinkCliente(cliente); setModalLinkOpen(true); }} style={{background:'#007bff',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px'}}>Link</button>
              <button onClick={() => { setClienteGestionar(cliente); setModalMotivoOpen(true); }} className="remove">Marcar gestión</button>
            </div>
          </div>
        </div>
      ))}
      {/* Modal para seleccionar motivo de gestión */}
      <ModalSeleccionMotivo
        open={modalMotivoOpen}
        onClose={() => setModalMotivoOpen(false)}
        onSave={handleGuardarMotivo}
      />
      {/* Modal para enviar link por WhatsApp */}
      <GestionLinkModalMobile
        open={modalLinkOpen}
        onClose={() => setModalLinkOpen(false)}
        usuarioId={linkCliente?.usuario}
        telefono={(linkCliente?.TELEFONO || linkCliente?.tel || "").replace(/[^\d]/g, "")}
      />
    </div>
  );
}
