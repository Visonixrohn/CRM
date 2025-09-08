import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import ChoferModal from "./ChoferModal";
import ChoferDetalleModal from "./ChoferDetalleModal";
import "./BotonesBar.css";
import "./AgregarEntregaForm.css";
import "./TablaEntregas.css";
import "./ActualizarEstatusModal.css";
import "./DetalleEntregaModal.css";

const estados = ["Pendiente", "Entregado", "Rechazado", "Reprogramado"];

function tiempoTranscurrido(fecha) {
  if (!fecha) return "-";
  const inicio = new Date(fecha);
  const ahora = new Date();
  const diff = Math.floor((ahora - inicio) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  return `${diff} días`;
}

const ModalEstatus = ({ open, onClose, onSelect }) => {
  if (!open) return null;
  return (
    <div className="actualizar-estatus-modal-bg">
      <div className="actualizar-estatus-modal">
        <div className="actualizar-estatus-titulo">Actualizar estatus</div>
        <div className="actualizar-estatus-btns">
          <button className="actualizar-estatus-btn" onClick={() => onSelect("Pendiente")}>Pendiente</button>
          <button className="actualizar-estatus-btn" onClick={() => onSelect("Entregado")}>Entregado</button>
          <button className="actualizar-estatus-btn" onClick={() => onSelect("Rechazado")}>Rechazado</button>
          <button className="actualizar-estatus-btn" onClick={() => onSelect("Reprogramado")}>Reprogramado</button>
        </div>
        <button className="actualizar-estatus-cerrar" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}; // Cierre faltante añadido

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
            onSelect={onUpdateEstatus}
          />
        )}
      </div>
    </div>
  );
};

const ModalAgregar = ({ open, onClose, onAdd }) => {
  const [touched, setTouched] = useState({});
  const [form, setForm] = useState({
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
  });
  const [mapCenter, setMapCenter] = useState({
    lat: 16.3832884,
    lng: -86.4460626,
  });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mapRef = React.useRef(null);

  useEffect(() => {
    if (!open || !window.google?.maps || !mapRef.current || mapLoaded) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 11.37,
      mapTypeId: "satellite",
    });

    let localMarker = null;
    const clickListener = map.addListener("click", (e) => {
      if (localMarker) localMarker.setMap(null);
      localMarker = new window.google.maps.Marker({
        position: e.latLng,
        map,
      });
      setForm((f) => ({
        ...f,
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
        ubicacion: `https://www.google.com/maps/@${e.latLng.lat()},${e.latLng.lng()},18z`,
      }));
      setMarker(localMarker);
    });

    setMapLoaded(true);

    // Limpiar listener al desmontar
    return () => {
      window.google.maps.event.removeListener(clickListener);
      if (localMarker) localMarker.setMap(null);
    };
  }, [open, mapLoaded, mapCenter]);

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
        });
        setTouched({});
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
  return (
    <div className="agregar-entrega-modal-bg">
      <div className="agregar-entrega-modal">
        <h4>Agregar entrega</h4>
        <div className="agregar-entrega-form-grid">
          <div className="agregar-entrega-form-col">
            <div className="input-group-float">
              <span className="input-icon"></span>
              <input
                type="text"
                value={form.cliente}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, cliente: true }))}
                required
                style={touched.cliente && !form.cliente ? { borderColor: "#ef4444" } : {}}
              />
              <label className={form.cliente ? "active" : ""}>Cliente</label>
            </div>
            <div className="input-group-float">
              <span className="input-icon"></span>
              <input
                type="text"
                value={form.factura}
                onChange={(e) => setForm({ ...form, factura: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, factura: true }))}
                required
                style={touched.factura && !form.factura ? { borderColor: "#ef4444" } : {}}
              />
              <label className={form.factura ? "active" : ""}>Factura</label>
            </div>
            <div className="input-group-float">
              <span className="input-icon"></span>
              <input
                type="text"
                value={form.cel}
                onChange={(e) => setForm({ ...form, cel: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, cel: true }))}
                required
                style={touched.cel && !form.cel ? { borderColor: "#ef4444" } : {}}
              />
              <label className={form.cel ? "active" : ""}>Cel</label>
            </div>
            <div className="input-group-float">
              <span className="input-icon"></span>
              <input
                type="text"
                value={form.articulo}
                onChange={(e) => setForm({ ...form, articulo: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, articulo: true }))}
                required
                style={touched.articulo && !form.articulo ? { borderColor: "#ef4444" } : {}}
              />
              <label className={form.articulo ? "active" : ""}>Artículo</label>
            </div>
            <div className="input-group-float">
              <span className="input-icon"></span>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, fecha: true }))}
                required
                style={touched.fecha && !form.fecha ? { borderColor: "#ef4444" } : {}}
              />
              <label className={form.fecha ? "active" : ""}>Fecha</label>
            </div>
            <div className="input-group-float">
              <span className="input-icon"></span>
              <input
                type="date"
                value={form.fecha_entrega}
                onChange={(e) => setForm({ ...form, fecha_entrega: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, fecha_entrega: true }))}
                required
                style={touched.fecha_entrega && !form.fecha_entrega ? { borderColor: "#ef4444" } : {}}
              />
              <label className={form.fecha_entrega ? "active" : ""}>Fecha de entrega</label>
            </div>
            <div className="input-group-float">
              <span className="input-icon"></span>
              <input
                type="text"
                value={form.ubicacion}
                readOnly
                required
                style={touched.lat && touched.lng && (!form.lat || !form.lng) ? { borderColor: "#ef4444" } : {}}
              />
              <label className={form.ubicacion ? "active" : ""}>Ubicación (se selecciona en el mapa)</label>
            </div>
            {error && <div style={{ color: "#ef4444", marginTop: 8 }}>{error}</div>}
          </div>
          <div className="agregar-entrega-form-col">
            <div
              style={{
                width: 250,
                height: 180,
                borderRadius: 12,
                overflow: "hidden",
                border: "1.5px solid #6366f1",
                background: "#e0e7ff",
              }}
            >
              <div ref={mapRef} style={{ width: "100%", height: "100%" }}></div>
            </div>
            <div style={{ fontSize: 12, color: "#6366f1", marginTop: 4 }}>
              Haz click en el mapa para seleccionar ubicación
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", marginTop: 16 }}>
          <button
            className="modern-agregar"
            onClick={handleAgregar}
            disabled={loading || !form.lat || !form.lng}
          >
            {loading ? "Guardando..." : "Agregar"}
          </button>
          <button className="modern-cerrar" onClick={onClose} disabled={loading}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

const Entregas = () => {
  const [entregas, setEntregas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [showAgregar, setShowAgregar] = useState(false);
  const [choferModal, setChoferModal] = useState(false); // Simplificado a booleano
  const [choferModalType, setChoferModalType] = useState("formulario"); // "formulario" o "detalle"
  const [chofer, setChofer] = useState(null);
  const [user, setUser] = useState(null);
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [busqueda, setBusqueda] = useState("");

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
  const handleUpdateEstatus = async (nuevo) => {
    if (!detalle) return;
    try {
      const { error } = await supabase
        .from("entregas_pendientes")
        .update({ estatus: nuevo })
        .eq("id", detalle.id);
      if (error) throw error;
      setEntregas(
        entregas.map((e) => (e.id === detalle.id ? { ...e, estatus: nuevo } : e))
      );
      setDetalle(null);
      setTimeout(() => {
        window.location.reload();
      }, 200);
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
        const { data: nuevas, error: err2 } = await supabase
          .from("entregas_pendientes")
          .select("*")
          .eq("usuario_id", user.id)
          .order("created_at", { ascending: false });
        if (err2) throw err2;
        setEntregas(nuevas || []);
        return true;
      }
    } catch (e) {
      console.error("Error al agregar entrega:", e.message);
      alert("No se pudo guardar la entrega. Intenta de nuevo.");
      return false;
    }
  };

  // Guardar datos del chofer
  const handleSaveChofer = async ({ nombre, contacto }) => {
    if (!user) return;
    try {
      const { data, error } = chofer
        ? await supabase
            .from("choferes")
            .update({ nombre, telefono: contacto })
            .eq("usuario_id", user.id)
            .select()
        : await supabase
            .from("choferes")
            .insert({ nombre, telefono: contacto, usuario_id: user.id })
            .select();
      if (error) throw error;
      if (data && data.length > 0) {
        setChofer(data[0]);
        alert("Datos del chofer guardados correctamente.");
        setChoferModal(false);
      }
    } catch (e) {
      console.error("Error al guardar los datos del chofer:", e.message);
      alert("Hubo un error al guardar los datos del chofer.");
    }
  };

  const handleChoferButtonClick = () => {
    setChoferModal(true);
    setChoferModalType(chofer ? "detalle" : "formulario");
  };

  return (
    <div className="entregas-modern-bg">
      <div className="botones-bar-container">
        <input
          type="text"
          placeholder="Buscar por cliente o factura..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: "8px", marginRight: "1rem" }}
        />
        <button className="btn-agregar" onClick={() => setShowAgregar(true)}>
          Agregar entrega
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
          className={`btn-filtro${filtroEstatus === "" ? " selected" : ""}`}
          onClick={() => setFiltroEstatus("")}
        >
          Todos
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
      </div>
      <div className="tabla-entregas-container">
        <table className="tabla-entregas">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Factura</th>
              <th>Cel</th>
              <th>Artículo</th>
              <th>Fecha</th>
              <th>Fecha de entrega</th>
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
                <td data-label="Tiempo">{tiempoTranscurrido(e.fecha)}</td>
                <td data-label="Estatus">
                  <span className={`modern-status modern-${e.estatus?.toLowerCase?.()}`}>
                    {e.estatus}
                  </span>
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
          onClose={() => setChoferModal(false)}
          onEdit={() => setChoferModalType("formulario")}
        />
      )}
      {choferModal && choferModalType === "formulario" && (
        <ChoferModal
          open={choferModal}
          onClose={() => setChoferModal(false)}
          onSave={handleSaveChofer}
          chofer={chofer}
        />
      )}
    </div>
  );
};

export default Entregas;