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


import "./EntregasNew.css";
import "./ModalesNew.css";

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
    <div className="modal-overlay">
      <div className="modal-container modal-agregar">
        <button className="modal-close-btn" onClick={onClose} disabled={loading}>×</button>
        <h2 className="modal-title">📦 Agregar Nueva Entrega</h2>
        
        <div className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre del cliente *</label>
              <input 
                type="text" 
                className={`form-input ${touched.cliente && !form.cliente ? 'error' : ''}`}
                value={form.cliente} 
                onChange={e => setForm({ ...form, cliente: e.target.value })} 
                onBlur={() => setTouched(t => ({ ...t, cliente: true }))}
                placeholder="Ingrese el nombre del cliente"
              />
            </div>
            <div className="form-group">
              <label className="form-label">No. Documento *</label>
              <input 
                type="text" 
                className={`form-input ${touched.factura && !form.factura ? 'error' : ''}`}
                value={form.factura} 
                onChange={e => setForm({ ...form, factura: e.target.value })} 
                onBlur={() => setTouched(t => ({ ...t, factura: true }))}
                placeholder="Número de factura"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Celular *</label>
              <input 
                type="tel" 
                className={`form-input ${touched.cel && !form.cel ? 'error' : ''}`}
                value={form.cel} 
                onChange={e => setForm({ ...form, cel: e.target.value })} 
                onBlur={() => setTouched(t => ({ ...t, cel: true }))}
                pattern="[0-9]{8,15}" 
                maxLength={15}
                placeholder="Ej: 98765432"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Artículo *</label>
              <input 
                type="text" 
                className={`form-input ${touched.articulo && !form.articulo ? 'error' : ''}`}
                value={form.articulo} 
                onChange={e => setForm({ ...form, articulo: e.target.value })} 
                onBlur={() => setTouched(t => ({ ...t, articulo: true }))}
                placeholder="Descripción del artículo"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha de entrega *</label>
              <input 
                type="date" 
                className={`form-input ${touched.fecha_entrega && !form.fecha_entrega ? 'error' : ''}`}
                value={form.fecha_entrega} 
                onChange={e => setForm({ ...form, fecha_entrega: e.target.value })} 
                onBlur={() => setTouched(t => ({ ...t, fecha_entrega: true }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de entrega</label>
              <select 
                className="form-select"
                value={form.tipo_entrega} 
                onChange={e => setForm({ ...form, tipo_entrega: e.target.value })}
              >
                <option value="TIENDA">🏪 Tienda</option>
                <option value="BODEGA SPS">📦 Bodega SPS</option>
                <option value="BODEGA TG">📦 Bodega TG</option>
                <option value="DOMICILIO">🏠 Domicilio</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Estado de gestión</label>
            <select 
              className="form-select"
              value={form.gestionada} 
              onChange={e => setForm({ ...form, gestionada: e.target.value })}
            >
              <option value="NO GESTIONADA">⏳ No gestionada</option>
              <option value="GESTIONADA">✅ Gestionada</option>
            </select>
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button 
              className="btn-secondary" 
              type="button" 
              onClick={onClose} 
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              className="btn-primary" 
              type="button" 
              onClick={handleAgregar} 
              disabled={loading}
            >
              {loading ? '⏳ Guardando...' : '✅ Agregar entrega'}
            </button>
          </div>
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
  const [filtroTipoEntrega, setFiltroTipoEntrega] = useState(""); // Nuevo filtro para tipo de entrega
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

  // Calcular conteos por tipo de entrega
  const conteoTipos = {
    'TODOS': entregas.filter(e => String(e.estatus || '').toLowerCase() !== 'entregado' && String(e.estatus || '').toLowerCase() !== 'rechazado').length,
    'TIENDA': entregas.filter(e => e.tipo_entrega === 'TIENDA' && String(e.estatus || '').toLowerCase() !== 'entregado' && String(e.estatus || '').toLowerCase() !== 'rechazado').length,
    'DOMICILIO': entregas.filter(e => e.tipo_entrega === 'DOMICILIO' && String(e.estatus || '').toLowerCase() !== 'entregado' && String(e.estatus || '').toLowerCase() !== 'rechazado').length,
    'BODEGA SPS': entregas.filter(e => e.tipo_entrega === 'BODEGA SPS' && String(e.estatus || '').toLowerCase() !== 'entregado' && String(e.estatus || '').toLowerCase() !== 'rechazado').length,
    'BODEGA TG': entregas.filter(e => e.tipo_entrega === 'BODEGA TG' && String(e.estatus || '').toLowerCase() !== 'entregado' && String(e.estatus || '').toLowerCase() !== 'rechazado').length,
  };

  // Filtrar entregas según estatus, búsqueda y tipo de entrega
  const entregasFiltradas = entregas
    .filter((e) => {
      // Ocultar entregados y rechazados salvo que el filtro sea 'Entregado' o 'Rechazado'
      if ((!filtroEstatus || filtroEstatus === "") && (e.estatus === "Entregado" || e.estatus === "Rechazado")) return false;
      const matchesEstatus = filtroEstatus ? e.estatus === filtroEstatus : true;
      const matchesTipoEntrega = filtroTipoEntrega ? e.tipo_entrega === filtroTipoEntrega : true;
      const matchesBusqueda = busqueda
        ? e.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
          e.factura.toLowerCase().includes(busqueda.toLowerCase())
        : true;
      const matchesNoGestionados = filtroNoGestionados ? (e.gestionada || '').toLowerCase() === 'no gestionada' : true;
      return matchesEstatus && matchesTipoEntrega && matchesBusqueda && matchesNoGestionados;
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
      {/* HEADER CON INFORMACIÓN DEL CHOFER */}
      <div className="entregas-header">
        <div className="entregas-header-info">
          <div className="chofer-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
            </svg>
          </div>
          <div className="chofer-details">
            <h3>
              {chofer ? `${chofer.nombre || 'Sin nombre'}` : 'Sin chofer registrado'}
            </h3>
            <p>{chofer ? `Tel: ${chofer.telefono || 'Sin número'}` : 'Configura tu chofer para entregas'}</p>
          </div>
        </div>
        <span className="chofer-pendientes">
          📦 {pendientesSinEntregar} sin entregar
        </span>
      </div>

      {/* BARRA DE ACCIONES Y BÚSQUEDA */}
      <div className="botones-bar-container">
        {/* Búsqueda */}
        <div className="entregas-busqueda-barra-container">
          <span className="entregas-busqueda-icono">🔍</span>
          <input
            type="text"
            placeholder="Buscar por cliente o factura..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="entregas-busqueda-barra"
          />
        </div>

        {/* Botones de acción principal */}
        <div className="actions-buttons">
          <button className="btn-agregar" onClick={() => setShowAgregar(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Agregar entrega
          </button>
          <button className="btn-chofer" onClick={handleChoferButtonClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
            </svg>
            Chofer
          </button>
        </div>

        {/* Filtros */}
        <div className="filtros-bar">
          <button
            className={`btn-filtro${filtroNoGestionados ? " selected" : ""}`}
            onClick={() => {
              setFiltroEstatus("");
              setFiltroNoGestionados((prev) => !prev);
            }}
          >
            📋 No gestionados
          </button>
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

      {/* CONTENEDOR CON SIDEBAR Y TABLA */}
      <div className="entregas-content-wrapper">
        {/* BARRA LATERAL CON FILTROS DE TIPO */}
        <aside className="entregas-sidebar">
          <h3 className="sidebar-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
            Tipo de Entrega
          </h3>
          <div className="sidebar-filters">
            <div 
              className={`sidebar-filter-item ${filtroTipoEntrega === "" ? "active" : ""}`}
              onClick={() => setFiltroTipoEntrega("")}
            >
              <span className="filter-label">
                📦 Todas
              </span>
              <span className="filter-count">{conteoTipos['TODOS']}</span>
            </div>
            <div 
              className={`sidebar-filter-item ${filtroTipoEntrega === "TIENDA" ? "active" : ""}`}
              onClick={() => setFiltroTipoEntrega(filtroTipoEntrega === "TIENDA" ? "" : "TIENDA")}
            >
              <span className="filter-label">
                🏪 Tienda
              </span>
              <span className="filter-count">{conteoTipos['TIENDA']}</span>
            </div>
            <div 
              className={`sidebar-filter-item ${filtroTipoEntrega === "DOMICILIO" ? "active" : ""}`}
              onClick={() => setFiltroTipoEntrega(filtroTipoEntrega === "DOMICILIO" ? "" : "DOMICILIO")}
            >
              <span className="filter-label">
                🏠 Domicilio
              </span>
              <span className="filter-count">{conteoTipos['DOMICILIO']}</span>
            </div>
            <div 
              className={`sidebar-filter-item ${filtroTipoEntrega === "BODEGA SPS" ? "active" : ""}`}
              onClick={() => setFiltroTipoEntrega(filtroTipoEntrega === "BODEGA SPS" ? "" : "BODEGA SPS")}
            >
              <span className="filter-label">
                📦 Bodega SPS
              </span>
              <span className="filter-count">{conteoTipos['BODEGA SPS']}</span>
            </div>
            <div 
              className={`sidebar-filter-item ${filtroTipoEntrega === "BODEGA TG" ? "active" : ""}`}
              onClick={() => setFiltroTipoEntrega(filtroTipoEntrega === "BODEGA TG" ? "" : "BODEGA TG")}
            >
              <span className="filter-label">
                📦 Bodega TG
              </span>
              <span className="filter-count">{conteoTipos['BODEGA TG']}</span>
            </div>
          </div>
        </aside>

        {/* TABLA DESKTOP CON SCROLL */}
        <div className="tabla-entregas-wrapper">
          <div className="tabla-entregas-scroll">
            <table className="tabla-entregas">
              <thead>
                <tr>
                  <th style={{width: '40px', textAlign: 'center'}}>✏️</th>
                  <th>Cliente</th>
                  <th>Documento</th>
                  <th>Teléfono</th>
                  <th>Artículo</th>
                  <th>Fecha entrega</th>
                  <th>Tipo</th>
                  <th>Gestión</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {entregasFiltradas.map((e) => {
                  // Determinar clase de fila según fecha
                  const hoy = new Date();
                  const yyyy = hoy.getFullYear();
                  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
                  const dd = String(hoy.getDate()).padStart(2, '0');
                  const hoyStr = `${yyyy}-${mm}-${dd}`;
                  const fechaEntrega = e.fecha_entrega;
                  const estatusLower = String(e.estatus).toLowerCase();
                  
                  let rowClass = '';
                  if (estatusLower !== 'entregado' && estatusLower !== 'rechazado') {
                    if (fechaEntrega < hoyStr) {
                      rowClass = 'atrasada';
                    } else if (fechaEntrega === hoyStr) {
                      rowClass = 'hoy';
                    }
                  }

                  return (
                    <tr key={e.id} className={rowClass}>
                      <td style={{textAlign:'center'}}>
                        <span 
                          title="Ver detalles" 
                          style={{cursor:'pointer',fontSize:'1.2em',color:'#6366f1'}} 
                          onClick={() => setDetalle(e)}
                        >
                          ✏️
                        </span>
                      </td>
                      <td>
                        <strong>{e.cliente}</strong>
                        <div style={{fontSize:'0.8em',color:'#64748b',marginTop:'0.25rem'}}>
                          Registrado: {e.fecha}
                        </div>
                      </td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                          <span>{e.factura}</span>
                          <button
                            title="Copiar factura"
                            style={{ 
                              background: 'none', 
                              border: 'none', 
                              cursor: 'pointer', 
                              color: '#6366f1', 
                              fontSize: '1.1em',
                              padding: '0.25rem'
                            }}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(e.factura);
                                ev.target.innerHTML = '✔️';
                                setTimeout(() => { if (ev.target) ev.target.innerHTML = '📋'; }, 1200);
                              }
                            }}
                          >
                            📋
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
                          {e.cel && (
                            <a
                              href={`https://web.whatsapp.com/send?phone=504${e.cel.replace(/[^\d]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="WhatsApp"
                              style={{ 
                                color: '#25D366', 
                                fontSize: '1.3em',
                                textDecoration: 'none'
                              }}
                              onClick={ev => ev.stopPropagation()}
                            >
                              <svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor">
                                <path d="M16 3C9.373 3 4 8.373 4 15c0 2.385.832 4.584 2.236 6.393L4 29l7.824-2.05C13.41 27.633 14.686 28 16 28c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.13 0-2.238-.188-3.287-.558l-.235-.08-4.646 1.217 1.24-4.527-.153-.236C7.188 19.238 7 18.13 7 17c0-4.963 4.037-9 9-9s9 4.037 9 9-4.037 9-9 9zm5.29-6.709c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.58.13-.17.26-.67.85-.82 1.02-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.08-1.28-.77-.68-1.29-1.52-1.44-1.78-.15-.26-.02-.4.11-.53.11-.11.26-.29.39-.44.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.58-1.4-.8-1.92-.21-.51-.43-.44-.58-.45-.15-.01-.32-.01-.5-.01-.17 0-.45.06-.68.28-.23.22-.9.88-.9 2.15s.92 2.49 1.05 2.66c.13.17 1.81 2.77 4.39 3.78.61.21 1.09.33 1.46.42.61.13 1.16.11 1.6.07.49-.05 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.07-.11-.24-.17-.5-.3z"/>
                              </svg>
                            </a>
                          )}
                          <span>{e.cel}</span>
                        </div>
                      </td>
                      <td>{e.articulo}</td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:'0.5rem',flexWrap:'wrap'}}>
                          {(() => {
                            if (estatusLower === 'rechazado') {
                              return (
                                <span className="badge-status badge-rechazado">
                                  ❌ ANULADO
                                </span>
                              );
                            }
                            if (estatusLower === 'entregado') {
                              return (
                                <span className="badge-status badge-entregado">
                                  ✅ TERMINADO
                                </span>
                              );
                            }
                            if (fechaEntrega === hoyStr) {
                              return (
                                <span className="badge-status badge-hoy">
                                  🔔 HOY
                                </span>
                              );
                            }
                            if (fechaEntrega < hoyStr) {
                              return (
                                <span className="badge-status badge-atrasada">
                                  ⚠️ ATRASADA
                                </span>
                              );
                            }
                            return <span style={{fontSize:'0.9rem'}}>{fechaEntrega}</span>;
                          })()}
                          <button
                            title="Cambiar fecha"
                            style={{
                              background:'none',
                              border:'none',
                              cursor:'pointer',
                              padding:'0.25rem',
                              color:'#6366f1'
                            }}
                            onClick={(ev) => {
                              ev.stopPropagation();
                              setFechaEntregaModal({open:true, entrega:e});
                            }}
                          >
                            📅
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`btn-table-action ${
                            e.tipo_entrega === 'TIENDA' ? 'btn-tienda' :
                            e.tipo_entrega === 'DOMICILIO' ? 'btn-domicilio' :
                            e.tipo_entrega === 'BODEGA SPS' ? 'btn-bodega-sps' :
                            e.tipo_entrega === 'BODEGA TG' ? 'btn-bodega-tg' : ''
                          }`}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setEntregaTipoModal({open:true, entrega:e});
                          }}
                        >
                          {e.tipo_entrega || 'Seleccionar'}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`btn-table-action ${
                            String(e.gestionada).toUpperCase() === 'GESTIONADA' ? 'btn-gestionada' : 'btn-no-gestionada'
                          }`}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setGestionadaModal({open:true, entrega:e});
                          }}
                        >
                          {String(e.gestionada).toUpperCase() === 'GESTIONADA' ? '✅ Gestionada' : '⏳ No gestionada'}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`badge-status ${
                            e.estatus === 'Entregado' ? 'badge-entregado' :
                            e.estatus === 'Pendiente' ? 'badge-pendiente' :
                            e.estatus === 'Rechazado' ? 'badge-rechazado' :
                            e.estatus === 'Reprogramado' ? 'badge-reprogramado' : 'badge-pendiente'
                          }`}
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setEstatusModal({open:true, entrega:e});
                          }}
                          style={{cursor:'pointer'}}
                        >
                          {e.estatus || 'Pendiente'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CARDS MÓVILES */}
      <div className="entregas-cards-mobile">
        {entregasFiltradas.map((e) => {
          // Determinar estado de fecha
          const hoy = new Date();
          const yyyy = hoy.getFullYear();
          const mm = String(hoy.getMonth() + 1).padStart(2, '0');
          const dd = String(hoy.getDate()).padStart(2, '0');
          const hoyStr = `${yyyy}-${mm}-${dd}`;
          const fechaEntrega = e.fecha_entrega;
          const estatusLower = String(e.estatus).toLowerCase();

          return (
            <div key={e.id} className="entrega-card-mobile" onClick={() => setDetalle(e)}>
              <div className="entrega-card-header">
                <div>
                  <div className="entrega-card-title">{e.cliente}</div>
                  <div className="entrega-card-factura">Doc: {e.factura}</div>
                </div>
                <button
                  className={`badge-status ${
                    e.estatus === 'Entregado' ? 'badge-entregado' :
                    e.estatus === 'Pendiente' ? 'badge-pendiente' :
                    e.estatus === 'Rechazado' ? 'badge-rechazado' :
                    e.estatus === 'Reprogramado' ? 'badge-reprogramado' : 'badge-pendiente'
                  }`}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setEstatusModal({open:true, entrega:e});
                  }}
                  style={{cursor:'pointer'}}
                >
                  {e.estatus || 'Pendiente'}
                </button>
              </div>

              <div className="entrega-card-body">
                <div className="entrega-card-row">
                  <span className="entrega-card-label">📱 Teléfono:</span>
                  <span className="entrega-card-value">
                    <a
                      href={`https://wa.me/504${e.cel?.replace(/[^\d]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{color:'#25D366',textDecoration:'none'}}
                      onClick={ev => ev.stopPropagation()}
                    >
                      {e.cel}
                    </a>
                  </span>
                </div>
                <div className="entrega-card-row">
                  <span className="entrega-card-label">📦 Artículo:</span>
                  <span className="entrega-card-value">{e.articulo}</span>
                </div>
                <div className="entrega-card-row">
                  <span className="entrega-card-label">📅 Fecha entrega:</span>
                  <span className="entrega-card-value">
                    {(() => {
                      if (estatusLower === 'rechazado') {
                        return <span className="badge-status badge-rechazado" style={{fontSize:'0.75rem',padding:'0.25rem 0.5rem'}}>ANULADO</span>;
                      }
                      if (estatusLower === 'entregado') {
                        return <span className="badge-status badge-entregado" style={{fontSize:'0.75rem',padding:'0.25rem 0.5rem'}}>TERMINADO</span>;
                      }
                      if (fechaEntrega === hoyStr) {
                        return <span className="badge-status badge-hoy" style={{fontSize:'0.75rem',padding:'0.25rem 0.5rem'}}>HOY</span>;
                      }
                      if (fechaEntrega < hoyStr) {
                        return <span className="badge-status badge-atrasada" style={{fontSize:'0.75rem',padding:'0.25rem 0.5rem'}}>ATRASADA</span>;
                      }
                      return fechaEntrega;
                    })()}
                  </span>
                </div>
                <div className="entrega-card-row">
                  <span className="entrega-card-label">🚚 Tipo:</span>
                  <span className="entrega-card-value">
                    <button
                      className={`btn-table-action ${
                        e.tipo_entrega === 'TIENDA' ? 'btn-tienda' :
                        e.tipo_entrega === 'DOMICILIO' ? 'btn-domicilio' :
                        e.tipo_entrega === 'BODEGA SPS' ? 'btn-bodega-sps' :
                        e.tipo_entrega === 'BODEGA TG' ? 'btn-bodega-tg' : ''
                      }`}
                      style={{fontSize:'0.75rem',padding:'0.35rem 0.65rem'}}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setEntregaTipoModal({open:true, entrega:e});
                      }}
                    >
                      {e.tipo_entrega || 'Seleccionar'}
                    </button>
                  </span>
                </div>
                <div className="entrega-card-row">
                  <span className="entrega-card-label">📋 Gestión:</span>
                  <span className="entrega-card-value">
                    <button
                      className={`btn-table-action ${
                        String(e.gestionada).toUpperCase() === 'GESTIONADA' ? 'btn-gestionada' : 'btn-no-gestionada'
                      }`}
                      style={{fontSize:'0.75rem',padding:'0.35rem 0.65rem'}}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setGestionadaModal({open:true, entrega:e});
                      }}
                    >
                      {String(e.gestionada).toUpperCase() === 'GESTIONADA' ? 'Gestionada' : 'No gestionada'}
                    </button>
                  </span>
                </div>
              </div>

              <div className="entrega-card-actions">
                <button
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#6366f1',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setDetalle(e);
                  }}
                >
                  Ver detalles
                </button>
              </div>
            </div>
          );
        })}
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