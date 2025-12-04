import ModalEstatus from "./components/ModalEstatus";
import "./EntregasBusqueda.css";
import React, { useState, useEffect } from "react";
// Eliminado uso de mapa en el formulario de agregar entregas
import EditFieldModal from "./EditFieldModal";
import EditUbicacionModal from "./EditUbicacionModal";
import EntregaCard from "./components/EntregaCard";
import { createPortal } from "react-dom";
import { supabase } from "./supabaseClient";
import ChoferModal from "./ChoferModal";
import ChoferDetalleModal from "./ChoferDetalleModal";
import ActualizarTipoEntregaModal from "./components/ActualizarTipoEntregaModal";
import ActualizarGestionadaModal from "./components/ActualizarGestionadaModal";
import ActualizarEstatusModal from "./components/ActualizarEstatusModal";
import ActualizarFechaEntregaModal from "./components/ActualizarFechaEntregaModal";

// ...existing code...


import "./BotonesBar.css";
import "./FiltrosBar.css";
import "./AgregarEntregaForm.css";
import "./AgregarEntregaMultiStep.css";
import "./TablaEntregas.css";
import "./ActualizarEstatusModal.css";
import "./DetalleEntregaModal.css";

const estados = ["Pendiente", "Entregado", "Rechazado", "Reprogramado"];

function tiempoTranscurrido(fecha, estatus) {
  if (estatus && estatus.toLowerCase() === "entregado") return "✔️";
  if (estatus && estatus.toLowerCase() === "rechazado") return "Rechazado";
  if (!fecha) return "-";
  const fechaEntrega = new Date(fecha);
  const ahora = new Date();
  const diffMs = ahora - fechaEntrega;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays > 0) return `${diffDays}  dias`;
  if (diffHrs > 0) return `${diffHrs} horas`;
  if (diffMins > 0) return `${diffMins} minutos`;
  return "ahora";
}

const ModalDetalle = ({ open, entrega, onClose, onUpdateEstatus, chofer, fetchEntregas }) => {
  const [editUbicacion, setEditUbicacion] = useState(false);
  const [showEstatus, setShowEstatus] = useState(false);
  const [editField, setEditField] = useState(null); // 'cliente', 'factura', 'cel', 'articulo'
  const [editValue, setEditValue] = useState("");

  // Actualizar el campo editado en Supabase
  const handleSaveEdit = async () => {
    if (!editField) return;
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .update({ [editField]: editValue })
        .eq("id", entrega.id);
      if (error) throw error;
      entrega[editField] = editValue; // Actualiza en memoria para feedback inmediato
      setEditField(null);
      if (typeof fetchEntregas === 'function') fetchEntregas();
    } catch (e) {
      alert("Error al actualizar en Supabase: " + (e.message || e));
    }
  };

  // Guardar nueva ubicación en Supabase
  const handleSaveUbicacion = async (nuevaUbicacion) => {
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .update({ ubicacion: nuevaUbicacion })
        .eq("id", entrega.id);
      if (error) throw error;
      entrega.ubicacion = nuevaUbicacion;
      setEditUbicacion(false);
      if (typeof fetchEntregas === 'function') fetchEntregas();
    } catch (e) {
      alert("Error al actualizar ubicación: " + (e.message || e));
    }
  };

  if (!open || !entrega) return null;

  // Extraer lat/lng de la ubicación si existe (eliminada duplicación)
  let urlMaps = null;
  let lat = null;
  let lng = null;
  if (entrega.ubicacion) {
    const match = entrega.ubicacion.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      lat = parseFloat(match[1]);
      lng = parseFloat(match[2]);
      urlMaps = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
  }

  const handleEnviarDatos = () => {
    // Construcción del mensaje de entrega
    const mensaje = `Entrega para: ${entrega.cliente}\nFactura: ${entrega.factura}\nTeléfono: ${entrega.cel}\nUbicación: https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    // Verifica si el dispositivo es móvil o no
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Usar el número del chofer de la entrega si existe, si no el global
    let telefono = (entrega.chofer_telefono || entrega.choferCel || entrega.cel_chofer || chofer?.telefono || chofer?.contacto || "").replace(/[^\d]/g, "");
    // Log para depuración
    if (telefono.startsWith("504")) {
      telefono = telefono.slice(3);
    }

    if (telefono.length !== 8) {
      alert("No hay un número de teléfono válido para WhatsApp del chofer");
      return;
    }

    let url = "";
    if (isMobile) {
      // Para móviles: https://wa.me/504XXXXXXXX?text=...
      url = `https://wa.me/504${telefono}?text=${encodeURIComponent(mensaje)}`;
    } else {
      // Para escritorio: https://web.whatsapp.com/send?phone=504XXXXXXXX&text=...
      url = `https://web.whatsapp.com/send?phone=504${telefono}&text=${encodeURIComponent(mensaje)}`;
    }
    window.open(url, "_blank");
  };

  // Mostrar el número que se usará para WhatsApp en el modal para depuración visual
  let telefonoDebug = (entrega.chofer_telefono || entrega.choferCel || entrega.cel_chofer || chofer?.telefono || chofer?.contacto || "").replace(/[^\d]/g, "");
  if (telefonoDebug.startsWith("504")) {
    telefonoDebug = telefonoDebug.slice(3);
  }
  return (
    <>
      {/* Modal de edición por campo, fuera del modal de entrega */}
      <EditFieldModal
        open={!!editField}
        field={editField}
        value={editValue}
        onChange={setEditValue}
        onClose={() => setEditField(null)}
        onSave={handleSaveEdit}
      />
      {/* Modal de edición de ubicación, fuera del modal de entrega */}
      <EditUbicacionModal
        open={editUbicacion}
        ubicacion={entrega.ubicacion}
        onSave={handleSaveUbicacion}
        onClose={() => setEditUbicacion(false)}
      />
      <div
        className="detalle-entrega-modal-bg"
        onClick={onClose}
        role="presentation"
        tabIndex={-1}
        aria-modal="true"
      >
        <div
          className="detalle-entrega-modal"
          onClick={e => e.stopPropagation()}
          role="dialog"
          tabIndex={0}
        >
          <div className="detalle-entrega-titulo">Detalle de Entrega</div>
          <div className="detalle-entrega-lista">
            <div className="detalle-entrega-item">
              <span className="detalle-entrega-label">Cliente:</span>
              <span className="detalle-entrega-valor">{entrega.cliente}</span>
              <button style={{marginLeft:8}} title="Editar Cliente" onClick={() => {setEditField('cliente'); setEditValue(entrega.cliente);}}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M4 21h17" stroke="#555" strokeWidth="2" strokeLinecap="round"/><path d="M12.5 7.5l4 4M3 17.25V21h3.75l11.06-11.06a1.5 1.5 0 0 0 0-2.12l-1.63-1.63a1.5 1.5 0 0 0-2.12 0L3 17.25z" stroke="#555" strokeWidth="2"/></svg>
              </button>
            </div>
            <div className="detalle-entrega-item">
              <span className="detalle-entrega-label">Factura:</span>
              <span className="detalle-entrega-valor">{entrega.factura}</span>
              <button style={{marginLeft:8}} title="Editar Factura" onClick={() => {setEditField('factura'); setEditValue(entrega.factura);}}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M4 21h17" stroke="#555" strokeWidth="2" strokeLinecap="round"/><path d="M12.5 7.5l4 4M3 17.25V21h3.75l11.06-11.06a1.5 1.5 0 0 0 0-2.12l-1.63-1.63a1.5 1.5 0 0 0-2.12 0L3 17.25z" stroke="#555" strokeWidth="2"/></svg>
              </button>
            </div>
            <div className="detalle-entrega-item">
              <span className="detalle-entrega-label">Teléfono:</span>
              <span className="detalle-entrega-valor">{entrega.cel}</span>
              <button style={{marginLeft:8}} title="Editar Teléfono" onClick={() => {setEditField('cel'); setEditValue(entrega.cel);}}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M4 21h17" stroke="#555" strokeWidth="2" strokeLinecap="round"/><path d="M12.5 7.5l4 4M3 17.25V21h3.75l11.06-11.06a1.5 1.5 0 0 0 0-2.12l-1.63-1.63a1.5 1.5 0 0 0-2.12 0L3 17.25z" stroke="#555" strokeWidth="2"/></svg>
              </button>
            </div>
            <div className="detalle-entrega-item">
              <span className="detalle-entrega-label">Artículo:</span>
              <span className="detalle-entrega-valor">{entrega.articulo}</span>
              <button style={{marginLeft:8}} title="Editar Artículo" onClick={() => {setEditField('articulo'); setEditValue(entrega.articulo);}}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M4 21h17" stroke="#555" strokeWidth="2" strokeLinecap="round"/><path d="M12.5 7.5l4 4M3 17.25V21h3.75l11.06-11.06a1.5 1.5 0 0 0 0-2.12l-1.63-1.63a1.5 1.5 0 0 0-2.12 0L3 17.25z" stroke="#555" strokeWidth="2"/></svg>
              </button>
            </div>
            <div className="detalle-entrega-item"><span className="detalle-entrega-label">Fecha:</span> <span className="detalle-entrega-valor">{entrega.fecha}</span></div>
            <div className="detalle-entrega-item"><span className="detalle-entrega-label">Fecha entrega:</span> <span className="detalle-entrega-valor">{entrega.fecha_entrega}</span></div>
            <div className="detalle-entrega-item"><span className="detalle-entrega-label">Estatus:</span> <span className="detalle-entrega-valor">{entrega.estatus}</span></div>
            <div className="detalle-entrega-item">
              <span className="detalle-entrega-label">Ubicación:</span>
              {urlMaps ? (
                <>
                  <a className="detalle-entrega-valor" href={urlMaps} target="_blank" rel="noopener noreferrer">Ver en Google Maps</a>
                </>
              ) : (
                <span className="detalle-entrega-valor">No definida</span>
              )}
              <button style={{marginLeft:8}} title="Editar Ubicación" onClick={() => setEditUbicacion(true)}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M4 21h17" stroke="#555" strokeWidth="2" strokeLinecap="round"/><path d="M12.5 7.5l4 4M3 17.25V21h3.75l11.06-11.06a1.5 1.5 0 0 0 0-2.12l-1.63-1.63a1.5 1.5 0 0 0-2.12 0L3 17.25z" stroke="#555" strokeWidth="2"/></svg>
              </button>
            </div>
          </div>
          <div style={{color:'#25D366',fontWeight:'bold',marginBottom:8}}>
            Cel. chofer: {telefonoDebug ? `+504 ${telefonoDebug}` : 'No detectado'}
          </div>
          <div className="detalle-entrega-botones">
            <button className="detalle-entrega-cerrar" onClick={onClose}>Cerrar</button>
            <button
              className="detalle-entrega-cerrar"
              style={{ background: "#4f46e5" }}
              onClick={() => setShowEstatus(true)}
            >
              Actualizar estatus
            </button>
            <button
              className="detalle-entrega-cerrar"
              style={{ background: "#25D366" }}
              onClick={handleEnviarDatos}
            >
              Enviar por WhatsApp
            </button>
          </div>
          {showEstatus && (
            <ModalEstatus
              open={showEstatus}
              onClose={() => setShowEstatus(false)}
              entrega={entrega}
              fetchEntregas={fetchEntregas}
              onSave={async (nuevoEstatus, nuevoTipo, nuevaGestionada) => {
                await onUpdateEstatus(nuevoEstatus, nuevoTipo, nuevaGestionada);
                setShowEstatus(false);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
};

const ModalAgregar = ({ open, onClose, onAdd }) => {
  const [touched, setTouched] = useState({});
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yyyy2 = tomorrow.getFullYear();
  const mm2 = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const dd2 = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowStr = `${yyyy2}-${mm2}-${dd2}`;
  const [form, setForm] = useState({
    cliente: "",
    factura: "",
    cel: "",
    articulo: "",
    estatus: "Pendiente",
    fecha: todayStr,
    fecha_entrega: tomorrowStr,
    tipo_entrega: "TIENDA",
    gestionada: "NO GESTIONADA",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const yyyy2 = tomorrow.getFullYear();
      const mm2 = String(tomorrow.getMonth() + 1).padStart(2, '0');
      const dd2 = String(tomorrow.getDate()).padStart(2, '0');
      const tomorrowStr = `${yyyy2}-${mm2}-${dd2}`;
      setForm({
        cliente: "",
        factura: "",
        cel: "",
        articulo: "",
        estatus: "Pendiente",
        fecha: todayStr,
        fecha_entrega: tomorrowStr,
        tipo_entrega: "TIENDA",
        gestionada: "NO GESTIONADA",
      });
      setTouched({});
    }
  }, [open]);

  const handleAgregar = async () => {
    setError("");
    const camposObligatorios = [
      "cliente",
      "factura",
      "cel",
      "articulo",
      "fecha",
      "fecha_entrega",
    ];
    const vacios = camposObligatorios.filter((c) => !form[c]);
    if (vacios.length > 0) {
      setTouched((prev) => ({
        ...prev,
        ...Object.fromEntries(vacios.map((c) => [c, true])),
      }));
      setError("Todos los campos obligatorios deben completarse.");
      return;
    }
    setLoading(true);
    try {
      const ok = await onAdd(form);
      if (ok) {
        setForm({
          cliente: "",
          factura: "",
          cel: "",
          articulo: "",
          estatus: "Pendiente",
          fecha: todayStr,
          fecha_entrega: tomorrowStr,
          tipo_entrega: "TIENDA",
          gestionada: "NO GESTIONADA",
        });
        setTouched({});
        onClose();
      } else {
        setError("No se pudo guardar la entrega. Intenta de nuevo.");
      }
    } catch (e) {
      setError("Error inesperado: " + (e.message || e));
    }
    setLoading(false);
  };

  if (!open) return null;
  return (
    <div className="agregar-entrega-modal-bg">
      <div className="agregar-entrega-modal" style={{ maxWidth: 1000, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>Agregar entrega</h3>
          <button className="modern-cerrar" onClick={onClose} disabled={loading} style={{ background: '#ef4444' }}>Cerrar</button>
        </div>
        <div className="agregar-entrega-form-grid" style={{ gap: 16 }}>
          <div className="agregar-entrega-form-col">
            <div className="input-group-float">
              <input type="text" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} onBlur={() => setTouched(t => ({ ...t, cliente: true }))} required style={touched.cliente && !form.cliente ? { borderColor: '#ef4444' } : {}} />
              <label className={form.cliente ? 'active' : ''}>Nombre del cliente *</label>
            </div>
            <div className="input-group-float">
              <input type="text" value={form.factura} onChange={e => setForm({ ...form, factura: e.target.value })} onBlur={() => setTouched(t => ({ ...t, factura: true }))} required style={touched.factura && !form.factura ? { borderColor: '#ef4444' } : {}} />
              <label className={form.factura ? 'active' : ''}>No. Documento *</label>
            </div>
            <div className="input-group-float">
              <input type="tel" value={form.cel} onChange={e => setForm({ ...form, cel: e.target.value })} onBlur={() => setTouched(t => ({ ...t, cel: true }))} required style={touched.cel && !form.cel ? { borderColor: '#ef4444' } : {}} pattern="[0-9]{8,15}" maxLength={15} />
              <label className={form.cel ? 'active' : ''}>Celular *</label>
            </div>
          </div>
          <div className="agregar-entrega-form-col">
            <div className="input-group-float">
              <input type="text" value={form.articulo} onChange={e => setForm({ ...form, articulo: e.target.value })} onBlur={() => setTouched(t => ({ ...t, articulo: true }))} required style={touched.articulo && !form.articulo ? { borderColor: '#ef4444' } : {}} />
              <label className={form.articulo ? 'active' : ''}>Artículo *</label>
            </div>
            <div style={{ display: 'block', gap: 12 }}>
              <div className="input-group-float">
                <input type="date" value={form.fecha_entrega} onChange={e => setForm({ ...form, fecha_entrega: e.target.value })} onBlur={() => setTouched(t => ({ ...t, fecha_entrega: true }))} required style={touched.fecha_entrega && !form.fecha_entrega ? { borderColor: '#ef4444' } : {}} />
                <label className={form.fecha_entrega ? 'active' : ''}>Fecha de entrega</label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 6, color: '#374151' }}>Tipo de entrega</label>
                <select value={form.tipo_entrega} onChange={e => setForm({ ...form, tipo_entrega: e.target.value })} style={{ width: '100%', borderRadius: 8, padding: '0.6rem', border: '1px solid #c7d2fe' }}>
                  <option value="TIENDA">Tienda</option>
                  <option value="BODEGA SPS">Bodega SPS</option>
                  <option value="BODEGA TG">Bodega TG</option>
                  <option value="DOMICILIO">Domicilio</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 6, color: '#374151' }}>Gestionada</label>
                <select value={form.gestionada} onChange={e => setForm({ ...form, gestionada: e.target.value })} style={{ width: '100%', borderRadius: 8, padding: '0.6rem', border: '1px solid #c7d2fe' }}>
                  <option value="NO GESTIONADA">NO GESTIONADA</option>
                  <option value="GESTIONADA">GESTIONADA</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {error && <div style={{ color: '#ef4444', marginTop: 12 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
          <button className="modern-cerrar" type="button" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="modern-agregar" type="button" onClick={handleAgregar} disabled={loading} style={{ background: '#0369a1' }}>{loading ? 'Guardando...' : 'Agregar entrega'}</button>
        </div>
      </div>
    </div>
  );
};

const Entregas = () => {
  // Estado para el modal de actualizar fecha de entrega
  const [fechaEntregaModal, setFechaEntregaModal] = useState({open:false, entrega:null});

  // Función para actualizar la fecha de entrega en Supabase
  const handleActualizarFechaEntrega = async (nuevaFecha) => {
    if (!fechaEntregaModal.entrega) return;
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .update({ fecha_entrega: nuevaFecha })
        .eq("id", fechaEntregaModal.entrega.id);
      if (error) throw error;
      if (typeof fetchEntregas === 'function') fetchEntregas();
    } catch (e) {
      alert("Error al actualizar la fecha de entrega: " + (e.message || e));
    }
    setFechaEntregaModal({open:false, entrega:null});
  };
  const [entregas, setEntregas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [showAgregar, setShowAgregar] = useState(false);
  const [choferModal, setChoferModal] = useState(false); // Simplificado a booleano
  const [choferModalType, setChoferModalType] = useState("formulario"); // "formulario" o "detalle"
  const [chofer, setChofer] = useState(null);
  const [user, setUser] = useState(null);
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [filtroNoGestionados, setFiltroNoGestionados] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [entregaTipoModal, setEntregaTipoModal] = useState({open:false, entrega:null});
  const [gestionadaModal, setGestionadaModal] = useState({open:false, entrega:null});
  const [estatusModal, setEstatusModal] = useState({open:false, entrega:null});

  // Handler para el botón Chofer
  const handleChoferButtonClick = () => {
    setChoferModal(true);
    setChoferModalType(chofer ? "detalle" : "formulario");
  };

  // Cargar chofer del usuario al iniciar y al cerrar el modal
  const fetchChofer = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("choferes")
        .select("*")
  .eq("usuario_id", user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      setChofer(data || null);
    } catch (e) {
      setChofer(null);
    }
  };
  useEffect(() => {
    fetchChofer();
    // eslint-disable-next-line
  }, [user]);

  // Handlers requeridos por EntregaCard
  const handleEdit = (entrega) => setDetalle(entrega);
  const handleDelete = () => alert('Función eliminar aún no implementada');

  // Obtener usuario autenticado desde localStorage y tabla profiles
  useEffect(() => {
    const getUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("No se pudo obtener el usuario autenticado.");
        setUser(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();
        if (error || !data) throw error || new Error("No existe el usuario");
        setUser(data);
      } catch (e) {
        console.error("Error al obtener usuario:", e?.message || e);
        alert("No se pudo obtener el usuario autenticado.");
        setUser(null);
      }
    };
    getUser();
  }, []);

  // Obtener entregas del usuario (reutilizable)
  const fetchEntregas = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("entregas_pendientes")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setEntregas(data || []);
    } catch (e) {
      console.error("Error al obtener entregas:", e.message);
      alert("No se pudieron cargar las entregas.");
    }
  };
  useEffect(() => {
    fetchEntregas();
  }, [user]);

  // Contador de entregas sin entregar (estatus distinto a 'Entregado')
  const pendientesSinEntregar = entregas.filter(e => String(e.estatus || '').toLowerCase() !== 'entregado').length;

  // Filtrar entregas según estatus y búsqueda
  const entregasFiltradas = entregas
    .filter((e) => {
      // Ocultar entregados y rechazados salvo que el filtro sea 'Entregado' o 'Rechazado'
      if ((!filtroEstatus || filtroEstatus === "") && (e.estatus === "Entregado" || e.estatus === "Rechazado")) return false;
      const matchesEstatus = filtroEstatus ? e.estatus === filtroEstatus : true;
      const matchesBusqueda = busqueda
        ? e.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
          e.factura.toLowerCase().includes(busqueda.toLowerCase())
        : true;
      const matchesNoGestionados = filtroNoGestionados ? (e.gestionada || '').toLowerCase() === 'no gestionada' : true;
      return matchesEstatus && matchesBusqueda && matchesNoGestionados;
    })
    .sort((a, b) => {
      // 1. Entregas atrasadas (fecha_entrega < hoy y no entregado) primero
      // 2. Entregas para hoy (fecha_entrega === hoy y no entregado)
      // 3. No gestionadas
      // 4. Pendientes
      // 5. Reprogramado
      // 6. Entregados
      const hoy = new Date();
      const yyyy = hoy.getFullYear();
      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
      const dd = String(hoy.getDate()).padStart(2, '0');
      const hoyStr = `${yyyy}-${mm}-${dd}`;
      const getFecha = (e) => (e.fecha_entrega ? e.fecha_entrega : '');
      const getEstatus = (e) => (e.estatus || '').toLowerCase();
      const getGestionada = (e) => (e.gestionada || '').toLowerCase();
      // Atrasadas
      const aAtrasada = getFecha(a) < hoyStr && getEstatus(a) !== 'entregado';
      const bAtrasada = getFecha(b) < hoyStr && getEstatus(b) !== 'entregado';
      if (aAtrasada !== bAtrasada) return bAtrasada - aAtrasada;
      // Para hoy
      const aHoy = getFecha(a) === hoyStr && getEstatus(a) !== 'entregado';
      const bHoy = getFecha(b) === hoyStr && getEstatus(b) !== 'entregado';
      if (aHoy !== bHoy) return bHoy - aHoy;
      // No gestionadas
      const aNoGest = getGestionada(a) === 'no gestionada';
      const bNoGest = getGestionada(b) === 'no gestionada';
      if (aNoGest !== bNoGest) return bNoGest - aNoGest;
      // Pendientes
      const aPend = getEstatus(a) === 'pendiente';
      const bPend = getEstatus(b) === 'pendiente';
      if (aPend !== bPend) return bPend - aPend;
      // Reprogramado
      const aReprog = getEstatus(a) === 'reprogramado';
      const bReprog = getEstatus(b) === 'reprogramado';
      if (aReprog !== bReprog) return bReprog - aReprog;
      // Entregados
      const aEntregado = getEstatus(a) === 'entregado';
      const bEntregado = getEstatus(b) === 'entregado';
      if (aEntregado !== bEntregado) return bEntregado - aEntregado;
      // Por defecto, más reciente primero
      return (getFecha(b) > getFecha(a)) ? 1 : -1;
    });

  // Actualizar estatus en Supabase
  const handleUpdateEstatus = async (nuevo, tipoEntrega, gestionada) => {
    if (!detalle) return;
    try {
      // SELECT previo para depuración
      const { data: preData, error: preError } = await supabase
        .from("entregas_pendientes")
        .select("*")
        .eq("id", detalle.id)
        .eq("usuario_id", user.id);
      if (!preData || preData.length === 0) {
        alert("No existe ningún registro con ese id y usuario_id. Verifica los valores.");
        return;
      }
      // const actual = preData[0];
      const { data, error } = await supabase
        .from("entregas_pendientes")
        .update({ estatus: nuevo, tipo_entrega: tipoEntrega, gestionada })
        .eq("id", detalle.id)
        .eq("usuario_id", user.id)
        .select(); // id del registro y usuario_id para seguridad
      if (error) {
        console.error("Supabase error:", error);
        alert("Error en Supabase: " + (error.message || error));
        return;
      }
      if (!data || data.length === 0) {
        alert("No se actualizó ningún registro en la base de datos. Verifica el id y usuario_id.");
        return;
      }
      setEntregas(
        entregas.map((e) =>
          e.id === detalle.id
            ? { ...e, estatus: nuevo, tipo_entrega: tipoEntrega, gestionada }
            : e
        )
      );
      setDetalle(null);
      window.location.reload();
    } catch (e) {
      console.error("Error al actualizar estatus:", e.message || e);
      alert("No se pudo actualizar el estatus. " + (e.message || e));
    }
  };

  // Agregar nueva entrega a Supabase
  const handleAdd = async (nuevo) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase
        .from("entregas_pendientes")
        .insert([{ ...nuevo, usuario_id: user.id }])
        .select();
      if (error) throw error;
      if (data && data.length > 0) {
        await fetchEntregas(); // Actualiza la tabla sin recargar
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  // Guardar o actualizar chofer en Supabase
  async function handleSaveChofer({ nombre, contacto }) {
    if (!user) return;
    try {
      let result;
      if (chofer) {
        // Actualizar
        result = await supabase
          .from("choferes")
          .update({ nombre, telefono: contacto })
          .eq("usuario_id", user.id);
      } else {
        // Insertar
        result = await supabase
          .from("choferes")
          .insert([{ nombre, telefono: contacto, usuario_id: user.id }]);
      }
      if (result.error) throw result.error;
      // Volver a cargar chofer
      const { data } = await supabase
        .from("choferes")
        .select("*")
  .eq("usuario_id", user.id)
        .single();
      setChofer(data || null);
      setChoferModalType("detalle");
    } catch (e) {
      alert("Error al guardar chofer: " + (e.message || e));
    }
  }

  // Return principal del componente
  return (
    <div className="entregas-modern-bg">
      {/* Mostrar datos del chofer arriba de la tabla */}
      <div style={{display: 'flex', alignItems: 'center', gap: 12, margin: '1rem 0 0.5rem 0'}}>
        <h3 style={{margin: 0, color: '#374151', fontWeight: 600, fontSize: '1.05rem'}}>
          Chofer: {chofer ? `${chofer.nombre || 'Sin nombre'} (${chofer.telefono || 'Sin número'})` : 'No registrado'}
        </h3>
        <span className="chofer-pendientes" title="Entregas sin entregar">Sin entregar: {pendientesSinEntregar}</span>
      </div>
  <div className="botones-bar-container">
        <div className="entregas-busqueda-barra-container">
          <input
            type="text"
            placeholder="Buscar por cliente o factura..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="entregas-busqueda-barra"
          />
          <span className="entregas-busqueda-icono">🔍</span>
        </div>
        <button className="btn-agregar" onClick={() => setShowAgregar(true)}>
          Agregar entrega
        </button>
        <button className="btn-chofer" title="Chofer" onClick={handleChoferButtonClick}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ verticalAlign: "middle", marginRight: 6 }}
          >
            <circle cx="12" cy="7" r="4" />
            <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
          </svg>
          Chofer
        </button>
        <button
          className={`btn-filtro${filtroNoGestionados ? " selected" : ""}`}
          style={{ marginLeft: 8 }}
          onClick={() => {
            setFiltroEstatus("");
            setFiltroNoGestionados((prev) => !prev);
          }}
        >
          No gestionados
        </button>
        <div className="filtros-bar">
          {estados.map((e) => (
            <button
              key={e}
              className={`btn-filtro${filtroEstatus === e ? " selected" : ""}`}
              onClick={() => setFiltroEstatus(e === filtroEstatus ? "" : e)}
            >
              {e}
            </button>
          ))}
          <button
            className={`btn-filtro${filtroEstatus === "" && !filtroNoGestionados ? " selected" : ""}`}
            onClick={() => {
              setFiltroEstatus("");
              setFiltroNoGestionados(false);
            }}
          >
            Todos
          </button>
        </div>
        
      </div>

      {/* Cards solo en móvil */}
      <div className="entregas-cards-mobile">
        {entregasFiltradas.map((entrega) => (
          <EntregaCard
            key={entrega.id}
            entrega={entrega}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Tabla solo en escritorio */}
      <div className="tabla-entregas-wrapper">
        <table className="tabla-entregas">
          <thead>
            <tr>
              <th>Edit</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Documento</th>
              <th>Cel</th>
              <th>Artículo</th>
              <th>Fecha de entrega</th>
              <th>Tipo de entrega</th>
              <th>Gestionada</th>
              <th>Tiempo</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            {entregasFiltradas.map((e) => (
              <tr key={e.id}>
                <td data-label="Editar" style={{textAlign:'center'}}>
                  <span title="Editar" style={{cursor:'pointer',fontSize:'1.2em',color:'#6366f1',verticalAlign:'middle'}} onClick={ev => {ev.stopPropagation(); setDetalle(e);}}>
                    ✏️
                  </span>
                </td>
                <td data-label="Fecha">{e.fecha}</td>
                <td data-label="Cliente">{e.cliente}</td>
                <td data-label="Factura">
                  
                  <button
                    title="Copiar factura"
                    style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: '1.1em', verticalAlign: 'middle' }}
                    onClick={ev => {
                      ev.stopPropagation();
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(e.factura);
                        ev.target.innerHTML = '✔️';
                        setTimeout(() => { if (ev.target) ev.target.innerHTML = '☰'; }, 1200);
                      }
                    }}
                  >
                    ☰
                  </button>{e.factura}
                </td>
                <td data-label="Cel">
                  
                  {e.cel && (
                    <a
                      href={`https://web.whatsapp.com/send?phone=504${e.cel.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Chatear por WhatsApp"
                      style={{ marginLeft: 8, color: '#25D366', fontSize: '1.3em', verticalAlign: 'middle', textDecoration: 'none' }}
                      onClick={ev => ev.stopPropagation()}
                    >
                      <svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor" style={{verticalAlign:'middle'}}>
                        <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.824-2.05C13.41 27.633 14.686 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.13 0-2.238-.188-3.287-.558l-.235-.08-4.646 1.217 1.24-4.527-.153-.236C7.188 19.238 7 18.13 7 17c0-4.963 4.037-9 9-9s9 4.037 9 9-4.037 9-9 9zm5.29-6.709c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.02-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.08-1.28-.77-.68-1.29-1.52-1.44-1.78-.15-.26-.02-.4.11-.53.11-.11.26-.29.39-.44.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.21-.51-.43-.44-.58-.45-.15-.01-.32-.01-.5-.01-.17 0-.45.06-.68.28-.23.22-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.81 2.77 4.39 3.78.61.21 1.09.33 1.46.42.61.13 1.16.11 1.6.07.49-.05 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3z"/>
                      </svg>
                    </a>
                  )}{e.cel}
                </td>
                <td data-label="Artículo">{e.articulo}</td>
                
                <td data-label="Fecha entrega">
                  <span style={{display:'flex',alignItems:'center',gap:8}}>
                    {(() => {
                      const hoy = new Date();
                      const yyyy = hoy.getFullYear();
                      const mm = String(hoy.getMonth() + 1).padStart(2, '0');
                      const dd = String(hoy.getDate()).padStart(2, '0');
                      const hoyStr = `${yyyy}-${mm}-${dd}`;
                      const fechaEntrega = e.fecha_entrega;
                      const estatusLower = String(e.estatus).toLowerCase();
                      if (estatusLower === 'rechazado') {
                        return (
                          <span style={{background:'#ef4444',color:'#fff',padding:'2px 8px',borderRadius:6,fontWeight:'bold'}}>
                            Anulado
                          </span>
                        );
                      }
                      if (estatusLower === 'entregado') {
                        return (
                          <span style={{background:'#10b981',color:'#fff',padding:'2px 8px',borderRadius:6,fontWeight:'bold'}}>
                            Terminado
                          </span>
                        );
                      }
                      if (fechaEntrega === hoyStr) {
                        return (
                          <span style={{background:'#fbbf24',color:'#b45309',padding:'2px 8px',borderRadius:6,fontWeight:'bold'}}>
                            ENTREGA PARA HOY
                          </span>
                        );
                      }
                      if (fechaEntrega < hoyStr) {
                        return (
                          <span style={{background:'#ef4444',color:'#fff',padding:'2px 8px',borderRadius:6,fontWeight:'bold'}}>
                            ENTREGA ATRASADA
                          </span>
                        );
                      }
                      return fechaEntrega;
                    })()}
                    <button
                      title="Actualizar fecha de entrega"
                      style={{background:'none',border:'none',cursor:'pointer',padding:0,margin:0,verticalAlign:'middle'}}
                      onClick={ev => {
                        ev.stopPropagation();
                        setFechaEntregaModal({open:true, entrega:e});
                      }}
                    >
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{color:'#6366f1'}}>
                        <rect x="3" y="4" width="18" height="18" rx="4" strokeWidth="2" stroke="currentColor" fill="#fff"/>
                        <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" stroke="currentColor"/>
                      </svg>
                    </button>
                  </span>
                </td>
                <td data-label="Tipo de entrega">
                  <button
                    type="button"
                    style={{
                      background: e.tipo_entrega ? 'linear-gradient(90deg,#6366f1 60%,#2563eb 100%)' : '#e0e7ff',
                      color: e.tipo_entrega ? '#fff' : '#1976d2',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '1em',
                      boxShadow: e.tipo_entrega ? '0 2px 8px #6366f122' : 'none',
                      transition: 'all .2s',
                      outline: e.tipo_entrega ? '2px solid #6366f1' : 'none',
                    }}
                    onClick={ev => {
                      ev.stopPropagation();
                      setEntregaTipoModal({open:true, entrega:e});
                    }}
                  >
                    {e.tipo_entrega || 'Seleccionar'}
                  </button>
                </td>
                <td data-label="Gestionada">
                  <button
                    type="button"
                    style={{
                      background: e.gestionada === 'Gestionada' ? 'linear-gradient(90deg,#22c55e 60%,#16a34a 100%)' : (e.gestionada === 'No gestionada' ? 'linear-gradient(90deg,#fbbf24 60%,#f59e42 100%)' : '#e0e7ff'),
                      color: e.gestionada === 'Gestionada' ? '#fff' : (e.gestionada === 'No gestionada' ? '#fff' : '#1976d2'),
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '1em',
                      boxShadow: e.gestionada ? '0 2px 8px #22c55e22' : 'none',
                      transition: 'all .2s',
                      outline: e.gestionada ? '2px solid #22c55e' : 'none',
                    }}
                    onClick={ev => {
                      ev.stopPropagation();
                      setGestionadaModal({open:true, entrega:e});
                    }}
                  >
                    {e.gestionada || 'Seleccionar'}
                  </button>
                </td>
                <td data-label="Tiempo">{tiempoTranscurrido(e.fecha, e.estatus)}</td>
                <td data-label="Estatus">
                  <button
                    type="button"
                    style={{
                      background: e.estatus === 'Entregado' ? 'linear-gradient(90deg,#38bdf8 60%,#0ea5e9 100%)' : (e.estatus === 'Pendiente' ? 'linear-gradient(90deg,#fbbf24 60%,#f59e42 100%)' : (e.estatus ? 'linear-gradient(90deg,#f472b6 60%,#be185d 100%)' : '#e0e7ff')),
                      color: e.estatus ? '#fff' : '#1976d2',
                      border: 'none',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '1em',
                      boxShadow: e.estatus ? '0 2px 8px #0ea5e922' : 'none',
                      transition: 'all .2s',
                      outline: e.estatus ? '2px solid #0ea5e9' : 'none',
                    }}
                    onClick={ev => {
                      ev.stopPropagation();
                      setEstatusModal({open:true, entrega:e});
                    }}
                  >
                    {e.estatus || 'Seleccionar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ModalDetalle
        open={!!detalle}
        entrega={detalle}
        onClose={() => setDetalle(null)}
        onUpdateEstatus={handleUpdateEstatus}
        chofer={chofer}
        fetchEntregas={fetchEntregas}
      />
      {typeof window !== 'undefined' && (
        <ActualizarFechaEntregaModal
          open={!!fechaEntregaModal.open}
          entrega={fechaEntregaModal.entrega}
          onClose={() => setFechaEntregaModal({open:false, entrega:null})}
          onUpdated={handleActualizarFechaEntrega}
        />
      )}
        <ActualizarTipoEntregaModal
          open={!!entregaTipoModal?.open}
          entrega={entregaTipoModal?.entrega}
          onClose={() => setEntregaTipoModal({open:false, entrega:null})}
          onUpdated={() => {
            setEntregaTipoModal({open:false, entrega:null});
            fetchEntregas();
          }}
        />
      
      {typeof window !== 'undefined' && (
        <ActualizarGestionadaModal
          open={!!gestionadaModal?.open}
          entrega={gestionadaModal?.entrega}
          onClose={() => setGestionadaModal({open:false, entrega:null})}
          onUpdated={() => {
            setGestionadaModal({open:false, entrega:null});
            fetchEntregas();
          }}
        />
      )}
      {typeof window !== 'undefined' && (
        <ActualizarEstatusModal
          open={!!estatusModal?.open}
          entrega={estatusModal?.entrega}
          onClose={() => setEstatusModal({open:false, entrega:null})}
          onUpdated={() => {
            setEstatusModal({open:false, entrega:null});
            fetchEntregas();
          }}
        />
      )}
      <ModalAgregar
        open={showAgregar}
        onClose={() => setShowAgregar(false)}
        onAdd={handleAdd}
      />
  {/* Botón flotante chofer-fab eliminado por solicitud del usuario */}
      {choferModal && choferModalType === "detalle" && (
        <ChoferDetalleModal
          open={choferModal}
          chofer={chofer}
          onClose={() => {
            setChoferModal(false);
            fetchChofer();
          }}
          onEdit={() => setChoferModalType("formulario")}
        />
      )}
      {choferModal && choferModalType === "formulario" && (
        <ChoferModal
          open={choferModal}
          onClose={() => {
            setChoferModal(false);
            fetchChofer();
          }}
          onSave={handleSaveChofer}
          chofer={chofer}
        />
      )}
    </div>
  );
  // --- FIX: Definir handleSaveChofer para evitar error de referencia ---
}


export default Entregas;