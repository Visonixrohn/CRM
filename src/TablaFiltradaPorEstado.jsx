
import React, { useState, useEffect } from "react";
import ModalSeleccionMotivo from "./ModalSeleccionMotivo";
import ModalGestionarGestion from "./ModalGestionarGestion";
import GestionLinkModalMobile from "./GestionLinkModalMobile";
import useGestion from "./useGestion";
import CardsFiltradasPorEstado from "./CardsFiltradasPorEstado";
import "./TablaFiltradaPorEstado.css";
import { supabase } from "./supabaseClient";


export default function TablaFiltradaPorEstado({ estado }) {
  // Hooks y funciones deben estar dentro del componente
  const [modalLinkOpen, setModalLinkOpen] = useState(false);
  const [linkCliente, setLinkCliente] = useState(null);
  const [modalMotivoOpen, setModalMotivoOpen] = useState(false);
  const [clienteGestionar, setClienteGestionar] = useState(null);
  const [update, setUpdate] = useState(0);
  const [modalGestionarOpen, setModalGestionarOpen] = useState(false);
  const [clienteGestionarDatos, setClienteGestionarDatos] = useState(null);
  const { datos, loading, error } = useGestion(update);

  // Función para copiar al portapapeles
  const copyToClipboard = (text, e) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        if (e && e.target) {
          e.target.innerHTML = "✔";
          setTimeout(() => {
            e.target.innerHTML = "📋";
          }, 2000);
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
          }, 2000);
        }
      } catch (err) {
        alert("Error al copiar el ID: Copia no soportada en este navegador.");
      }
    }
  };

  // Guardar datos en tabla seguimiento
  const handleGuardarGestion = async (datos) => {
    if (!clienteGestionarDatos) return;
    try {
      const nombre = (clienteGestionarDatos.NOMBRES || clienteGestionarDatos.nombre || '') + ' ' + (clienteGestionarDatos.APELLIDOS || clienteGestionarDatos.apellido || '');
      const dni = clienteGestionarDatos.ID || clienteGestionarDatos.id || '';
      const cel = clienteGestionarDatos.TELEFONO || clienteGestionarDatos.tel || '';
      const userId = localStorage.getItem("userId");
      const { articulo, tipo, fecha } = datos;
      const { error } = await supabase.from('seguimiento').insert([
        {
          id_usuario: userId,
          nombre_cliente: nombre.trim(),
          dni: dni,
          cel: cel,
          articulo,
          tipo,
          fecha_de_acuerdo: fecha,
          estado: 'Gestionado',
        }
      ]);
      if (error) alert('Error al guardar en seguimiento: ' + error.message);
      setModalGestionarOpen(false);
      setClienteGestionarDatos(null);
    } catch (err) {
      alert('Error inesperado al guardar en seguimiento');
    }
  };

  // Filtrar por estado, usuario y tienda ya lo hace useGestion
  const filas = datos.filter(
    (c) => (c.estado || "").toLowerCase() === estado.toLowerCase()
  );


  // Lógica para guardar motivo
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

  // Función para enviar WhatsApp
  const enviarWhatsApp = (cliente) => {
    const mensajeBase = "Hola 😇 {NOMBRE}";
    const numeroRaw = cliente.TELEFONO || cliente.tel || "";
    const numero = String(numeroRaw).replace(/[^\d]/g, "");
    if (!numero) {
      alert("El cliente no tiene número de teléfono válido.");
      return;
    }
    const texto = encodeURIComponent(
      mensajeBase.replace("{NOMBRE}", cliente.NOMBRES || cliente.nombre || "")
    );
    const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    let url = "";
    if (isMobile) {
      url = `https://wa.me/504${numero}?text=${texto}`;
    } else {
      url = `https://web.whatsapp.com/send?phone=504${numero}&text=${texto}`;
    }
    window.open(url, "_blank");
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      {/* Solo visible en desktop */}
      <div className="solo-desktop">
        <div style={{ padding: "0 8px" }}>
          <button
            onClick={() => window.history.back()}
            style={{
              marginBottom: 24,
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
            onMouseOver={(e) => (e.currentTarget.style.background = "#6366f1")}
            onMouseOut={(e) =>
              (e.currentTarget.style.background =
                "linear-gradient(90deg,#6366f1 0%,#818cf8 100%)")
            }
          >
            ← Regresar
          </button>
          <h2
            style={{
              marginBottom: 24,
              marginTop: 0,
              fontWeight: 800,
              letterSpacing: 1.2,
              color: "#3730a3",
              fontSize: 28,
              textAlign: "center",
              textTransform: "capitalize",
            }}
          >
            Clientes {estado.replace("_", " ")}
          </h2>
          <div className="table-container">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Teléfono</th>
                  <th>Tienda</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((cliente) => {
                  const idStr = String(cliente.ID || cliente.id);
                  const idToCopy = idStr.length === 12 ? '0' + idStr : idStr;
                  return (
                    <tr key={cliente.ID || cliente.id}>
                      <td>
                        {idToCopy}
                        <span
                          className="copy-btn"
                          title="Copiar ID"
                          style={{ marginLeft: 5, cursor: 'pointer' }}
                          onClick={(e) => copyToClipboard(idToCopy, e)}
                        >
                          📋
                        </span>
                      </td>
                      <td>{cliente.NOMBRES || cliente.nombre}</td>
                      <td>{cliente.APELLIDOS || cliente.apellido}</td>
                      <td>{cliente.TELEFONO || cliente.tel}</td>
                      <td>{cliente.TIENDA || cliente.tienda}</td>
                      <td>
                       
                        <button style={{marginLeft:4,marginRight:4,background:'#15803d',color:'#fff',border:'none',borderRadius:6,padding:'6px 12px'}}
                          onClick={() => {
                            setClienteGestionarDatos(cliente);
                            setModalGestionarOpen(true);
                          }}
                        >
                          Crear seguimiento
                        </button>
                          <button className="remove" style={{background: "#f59e42", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontWeight: 600, cursor: "pointer"}}
                          onClick={() => {
                            setClienteGestionar(cliente);
                            setModalMotivoOpen(true);
                          }}
                        >
                          Cambiar status
                        </button> <button onClick={() => enviarWhatsApp(cliente)}>
                          Enviar Whatsaap
                        </button>
          {/* Modal para gestionar cliente */}
          <ModalGestionarGestion
            open={modalGestionarOpen}
            onClose={() => { setModalGestionarOpen(false); setClienteGestionarDatos(null); }}
            initialData={{ articulo: '', tipo: 'CONTADO', fecha: undefined }}
            onSave={handleGuardarGestion}
          />
                        <button style={{marginLeft:4,marginRight:4}} onClick={() => { setLinkCliente(cliente); setModalLinkOpen(true); }}>
                          Link de solicitud
                        </button>
                      
                      </td>
                    </tr>
                  );
                })}
                {filas.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#64748b", padding: 24 }}>
                      No hay clientes con estado "{estado}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
      </div>
      {/* Solo visible en móvil */}
      <div className="solo-movil">
        <CardsFiltradasPorEstado filas={filas} />
      </div>
    </>
  );
}
