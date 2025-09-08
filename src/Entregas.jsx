import ModalEstatus from "./components/ModalEstatus";
import "./EntregasBusqueda.css";
import React, { useState, useEffect } from "react";
import EntregaCard from "./components/EntregaCard";
import { createPortal } from "react-dom";
import { supabase } from "./supabaseClient";
import ChoferModal from "./ChoferModal";
import ChoferDetalleModal from "./ChoferDetalleModal";
import "./BotonesBar.css";
import "./FiltrosBar.css";
import "./AgregarEntregaForm.css";
import "./AgregarEntregaMultiStep.css";
import "./TablaEntregas.css";
import "./ActualizarEstatusModal.css";
import "./DetalleEntregaModal.css";

const estados = ["Pendiente", "Entregado", "Rechazado", "Reprogramado"];

function tiempoTranscurrido(fecha) {
  if (!fecha) return "-";
  const fechaEntrega = new Date(fecha);
  const ahora = new Date();
  const diffMs = ahora - fechaEntrega;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays > 0) return `${diffDays}d`;
  if (diffHrs > 0) return `${diffHrs}h`;
  if (diffMins > 0) return `${diffMins}min`;
  return "ahora";
}

const ModalDetalle = ({ open, entrega, onClose, onUpdateEstatus, chofer }) => {
  const [showEstatus, setShowEstatus] = useState(false);

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
    const baseUrl = isMobile ? "https://wa.me/" : "https://web.whatsapp.com/send";

    // Usar el número del chofer
    let telefono = (chofer?.telefono || chofer?.contacto || "").replace(/[^\d]/g, "");
    if (telefono.startsWith("504")) {
      telefono = telefono.slice(3);
    }

    if (telefono.length !== 8) {
      alert("No hay un número de teléfono válido para WhatsApp del chofer");
      return;
    }

    const url = `${baseUrl}?phone=504${telefono}&text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="detalle-entrega-modal-bg">
      <div className="detalle-entrega-modal">
        <div className="detalle-entrega-titulo">Detalle de Entrega</div>
        <div className="detalle-entrega-lista">
          <div className="detalle-entrega-item"><span className="detalle-entrega-label">Cliente:</span> <span className="detalle-entrega-valor">{entrega.cliente}</span></div>
          <div className="detalle-entrega-item"><span className="detalle-entrega-label">Factura:</span> <span className="detalle-entrega-valor">{entrega.factura}</span></div>
          <div className="detalle-entrega-item"><span className="detalle-entrega-label">Teléfono:</span> <span className="detalle-entrega-valor">{entrega.cel}</span></div>
          <div className="detalle-entrega-item"><span className="detalle-entrega-label">Artículo:</span> <span className="detalle-entrega-valor">{entrega.articulo}</span></div>
          <div className="detalle-entrega-item"><span className="detalle-entrega-label">Fecha:</span> <span className="detalle-entrega-valor">{entrega.fecha}</span></div>
          <div className="detalle-entrega-item"><span className="detalle-entrega-label">Fecha entrega:</span> <span className="detalle-entrega-valor">{entrega.fecha_entrega}</span></div>
          <div className="detalle-entrega-item"><span className="detalle-entrega-label">Estatus:</span> <span className="detalle-entrega-valor">{entrega.estatus}</span></div>
          {urlMaps && (
            <div className="detalle-entrega-item">
              <span className="detalle-entrega-label">Ubicación:</span>
              <a className="detalle-entrega-valor" href={urlMaps} target="_blank" rel="noopener noreferrer">Ver en Google Maps</a>
            </div>
          )}
        </div>
        <button className="detalle-entrega-cerrar" onClick={onClose}>Cerrar</button>
        <button
          className="detalle-entrega-cerrar"
          style={{ background: "#4f46e5", marginTop: "0.5rem" }}
          onClick={() => setShowEstatus(true)}
        >
          Actualizar estatus
        </button>
        <button
          className="detalle-entrega-cerrar"
          style={{ background: "#25D366", marginTop: "0.5rem" }}
          onClick={handleEnviarDatos}
        >
          Enviar por WhatsApp
        </button>
        {showEstatus && (
          <ModalEstatus
            open={showEstatus}
            onClose={() => setShowEstatus(false)}
            entrega={entrega}
            onSave={async (nuevoEstatus, nuevoTipo, nuevaGestionada) => {
              await onUpdateEstatus(nuevoEstatus, nuevoTipo, nuevaGestionada);
              setShowEstatus(false);
            }}
          />
        )}
      </div>
    </div>
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
    ubicacion: "",
    lat: 16.3832884,
    lng: -86.4460626,
    tipo_entrega: "TIENDA",
    gestionada: "NO GESTIONADA",
  });
  const [mapCenter, setMapCenter] = useState({
    lat: 16.3832884,
    lng: -86.4460626,
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const mapRef = React.useRef(null);

  useEffect(() => {
    if (!open || !window.google?.maps || !mapRef.current || step !== 2) return;
    let map = null;
    let localMarker = null;
    // Inicializar mapa
    map = new window.google.maps.Map(mapRef.current, {
      center: { lat: form.lat, lng: form.lng },
      zoom: 13,
      mapTypeId: "satellite",
      gestureHandling: "greedy"
    });
    // Crear marcador arrastrable
    localMarker = new window.google.maps.Marker({
      position: { lat: form.lat, lng: form.lng },
      map,
      draggable: true,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: new window.google.maps.Size(40, 40),
      },
    });
    setMarker(localMarker);
    // Al hacer click/tap en el mapa, mover el marcador
    const clickListener = map.addListener("click", (e) => {
      localMarker.setPosition(e.latLng);
      setForm((f) => ({
        ...f,
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        ubicacion: `https://www.google.com/maps/@${e.latLng.lat()},${e.latLng.lng()},18z`,
      }));
    });
    // Al arrastrar el marcador
    const dragListener = localMarker.addListener("dragend", (e) => {
      setForm((f) => ({
        ...f,
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        ubicacion: `https://www.google.com/maps/@${e.latLng.lat()},${e.latLng.lng()},18z`,
      }));
    });
    setMapLoaded(true);
    return () => {
      window.google.maps.event.removeListener(clickListener);
      window.google.maps.event.removeListener(dragListener);
      if (localMarker) localMarker.setMap(null);
    };
    // eslint-disable-next-line
  }, [open, step]);

  useEffect(() => {
    if (!open) {
      setMapLoaded(false);
      setMarker(null);
      setForm({
        cliente: "",
        factura: "",
        cel: "",
        articulo: "",
        estatus: "Pendiente",
        fecha: "",
        fecha_entrega: "",
        ubicacion: "",
        lat: 16.3832884,
        lng: -86.4460626,
        tipo_entrega: "TIENDA",
        gestionada: "NO GESTIONADA",
      });
      setTouched({});
      setStep(0);
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
      "lat",
      "lng",
    ];
    const vacios = camposObligatorios.filter((c) => !form[c]);
    if (vacios.length > 0) {
      setTouched((prev) => ({
        ...prev,
        ...Object.fromEntries(vacios.map((c) => [c, true])),
      }));
      setError("Todos los campos son obligatorios y debes seleccionar ubicación en el mapa.");
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
          fecha: "",
          fecha_entrega: "",
          ubicacion: "",
          lat: 16.3832884,
          lng: -86.4460626,
          tipo_entrega: "TIENDA",
          gestionada: "NO GESTIONADA",
        });
        setTouched({});
        setStep(0);
        onClose();
      } else {
        setError("No se pudo guardar la entrega. Intenta de nuevo.");
      }
    } catch (e) {
      setError("Error inesperado: " + e.message);
    }
    setLoading(false);
  };

  if (!open) return null;
  // Pasos: 0 = datos básicos, 1 = fechas y tipo, 2 = ubicación
  return (
    <div className="agregar-entrega-modal-bg">
      <div className="agregar-entrega-modal" style={{ maxWidth: 400, minWidth: 0 }}>
        <div className="agregar-entrega-multistep">
          <div className="agregar-entrega-steps">
            {["1", "2", "3"].map((n, i) => (
              <div key={i} className={`agregar-entrega-step${step === i ? " active" : step > i ? " done" : ""}`}>{n}</div>
            ))}
          </div>
          <div className="agregar-entrega-multistep-content">
            {step === 0 && (
              <>
                <div className="input-group-float">
                  <input type="text" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} onBlur={() => setTouched(t => ({ ...t, cliente: true }))} required style={touched.cliente && !form.cliente ? { borderColor: "#ef4444" } : {}} />
                  <label className={form.cliente ? "active" : ""}>Nombre del cliente *</label>
                </div>
                <div className="input-group-float">
                  <input type="number" value={form.factura} onChange={e => setForm({ ...form, factura: e.target.value })} onBlur={() => setTouched(t => ({ ...t, factura: true }))} required style={touched.factura && !form.factura ? { borderColor: "#ef4444" } : {}} />
                  <label className={form.factura ? "active" : ""}>Factura *</label>
                </div>
                <div className="input-group-float">
                  <input type="tel" value={form.cel} onChange={e => setForm({ ...form, cel: e.target.value })} onBlur={() => setTouched(t => ({ ...t, cel: true }))} required style={touched.cel && !form.cel ? { borderColor: "#ef4444" } : {}} pattern="[0-9]{8,15}" maxLength={15} />
                  <label className={form.cel ? "active" : ""}>Celular *</label>
                </div>
                <div className="input-group-float">
                  <input type="text" value={form.articulo} onChange={e => setForm({ ...form, articulo: e.target.value })} onBlur={() => setTouched(t => ({ ...t, articulo: true }))} required style={touched.articulo && !form.articulo ? { borderColor: "#ef4444" } : {}} />
                  <label className={form.articulo ? "active" : ""}>Artículo</label>
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div className="input-group-float">
                  <input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} onBlur={() => setTouched(t => ({ ...t, fecha: true }))} required style={touched.fecha && !form.fecha ? { borderColor: "#ef4444" } : {}} />
                  <label className={form.fecha ? "active" : ""}>Fecha</label>
                </div>
                <div className="input-group-float">
                  <input type="date" value={form.fecha_entrega} onChange={e => setForm({ ...form, fecha_entrega: e.target.value })} onBlur={() => setTouched(t => ({ ...t, fecha_entrega: true }))} required style={touched.fecha_entrega && !form.fecha_entrega ? { borderColor: "#ef4444" } : {}} />
                  <label className={form.fecha_entrega ? "active" : ""}>Fecha de entrega</label>
                </div>
                <div className="input-group-float">
                  <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Tipo de entrega</label>
                  <select value={form.tipo_entrega} onChange={e => setForm({ ...form, tipo_entrega: e.target.value })} style={{ width: '100%', marginTop: 4, borderRadius: 8, padding: '0.5rem' }}>
                    <option value="TIENDA">Tienda</option>
                    <option value="BODEGA SPS">Bodega SPS</option>
                    <option value="BODEGA TG">Bodega TG</option>
                    <option value="DOMICILIO">Domicilio</option>
                  </select>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="input-group-float">
                  <input type="text" value={form.ubicacion} readOnly required style={touched.lat && touched.lng && (!form.lat || !form.lng) ? { borderColor: "#ef4444" } : {}} />
                  <label className={form.ubicacion ? "active" : ""}>Ubicación (se selecciona en el mapa)</label>
                </div>
                <div className="mapa-entrega">
                  <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
                </div>
                <div style={{ fontSize: 12, color: "#6366f1", marginTop: 4, textAlign: "center" }}>
                  Haz click en el mapa para seleccionar ubicación
                </div>
              </>
            )}
            {error && <div style={{ color: "#ef4444", marginTop: 8 }}>{error}</div>}
          </div>
          <div className="agregar-entrega-multistep-nav">
            <button className="modern-cerrar" type="button" onClick={onClose} disabled={loading}>Cancelar</button>
            {step > 0 && <button className="modern-agregar" type="button" onClick={() => setStep(step - 1)} disabled={loading}>Atrás</button>}
            {step < 2 && (
              <button
                className="modern-agregar"
                type="button"
                onClick={() => {
                  // Validar antes de avanzar
                  if (step === 0) {
                    const campos = ["cliente", "factura", "cel"];
                    const vacios = campos.filter((c) => !form[c]);
                    setTouched((prev) => ({ ...prev, ...Object.fromEntries(campos.map((c) => [c, true])) }));
                    if (vacios.length > 0) return;
                  }
                  setStep(step + 1);
                }}
                disabled={loading}
              >
                Siguiente
              </button>
            )}
            {step === 2 && <button className="modern-agregar" type="button" onClick={handleAgregar} disabled={loading || !form.lat || !form.lng}>{loading ? "Guardando..." : "Agregar"}</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Entregas = () => {

  // --- Declarar todos los useState ANTES de cualquier useEffect ---
  const [entregas, setEntregas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [showAgregar, setShowAgregar] = useState(false);
  const [choferModal, setChoferModal] = useState(false); // Simplificado a booleano
  const [choferModalType, setChoferModalType] = useState("formulario"); // "formulario" o "detalle"
  const [chofer, setChofer] = useState(null);
  const [user, setUser] = useState(null);
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [busqueda, setBusqueda] = useState("");

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

  // Obtener usuario autenticado
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(data?.user || null);
      } catch (e) {
        console.error("Error al obtener usuario:", e.message);
        alert("No se pudo obtener el usuario autenticado.");
      }
    };
    getUser();
  }, []);

  // Obtener entregas del usuario
  useEffect(() => {
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
    fetchEntregas();
  }, [user]);

  // Filtrar entregas según estatus y búsqueda
  const entregasFiltradas = entregas.filter((e) => {
    const matchesEstatus = filtroEstatus ? e.estatus === filtroEstatus : true;
    const matchesBusqueda = busqueda
      ? e.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
        e.factura.toLowerCase().includes(busqueda.toLowerCase())
      : true;
    return matchesEstatus && matchesBusqueda;
  });

  // Actualizar estatus en Supabase
  const handleUpdateEstatus = async (nuevo, tipoEntrega, gestionada) => {
    if (!detalle) return;
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .update({ estatus: nuevo, tipo_entrega: tipoEntrega, gestionada })
        .eq("id", detalle.id);
      if (error) throw error;
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
      console.error("Error al actualizar estatus:", e.message);
      alert("No se pudo actualizar el estatus.");
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
      <h3 style={{margin: '1rem 0 0.5rem 0', color: '#374151', fontWeight: 600, fontSize: '1.1rem'}}>
        Chofer: {chofer ? `${chofer.nombre || 'Sin nombre'} (${chofer.telefono || 'Sin número'})` : 'No registrado'}
      </h3>
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
            className={`btn-filtro${filtroEstatus === "" ? " selected" : ""}`}
            onClick={() => setFiltroEstatus("")}
          >
            Todos
          </button>
        </div>
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
              <th>Cliente</th>
              <th>Factura</th>
              <th>Cel</th>
              <th>Artículo</th>
              <th>Fecha</th>
              <th>Fecha de entrega</th>
              <th>Tipo de entrega</th>
              <th>Gestionada</th>
              <th>Tiempo</th>
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            {entregasFiltradas.map((e) => (
              <tr key={e.id} onClick={() => setDetalle(e)}>
                <td data-label="Cliente">{e.cliente}</td>
                <td data-label="Factura">{e.factura}</td>
                <td data-label="Cel">{e.cel}</td>
                <td data-label="Artículo">{e.articulo}</td>
                <td data-label="Fecha">{e.fecha}</td>
                <td data-label="Fecha entrega">{e.fecha_entrega}</td>
                <td data-label="Tipo de entrega">
                  <span className={`modern-tipoentrega modern-tipoentrega-${(e.tipo_entrega || '').toLowerCase().replace(/\s/g, '-')}`}>{e.tipo_entrega}</span>
                </td>
                <td data-label="Gestionada">
                  <span className={`modern-gestionada modern-gestionada-${(e.gestionada || '').toLowerCase().replace(/\s/g, '-')}`}>{e.gestionada}</span>
                </td>
                <td data-label="Tiempo">{tiempoTranscurrido(e.fecha)}</td>
                <td data-label="Estatus">
                  <span className={`modern-status modern-${e.estatus?.toLowerCase?.()}`}>{e.estatus}</span>
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
      />
      <ModalAgregar
        open={showAgregar}
        onClose={() => setShowAgregar(false)}
        onAdd={handleAdd}
      />
      <button
        className="chofer-fab"
        title="Datos de chofer"
        onClick={handleChoferButtonClick}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
        </svg>
      </button>
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