import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import ChoferModal from "./ChoferModal";
import ChoferDetalleModal from "./ChoferDetalleModal";
import "./EntregasModern.css";
import Modals from "./ModalInput";
import "./Entregas.css";

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
    <div className="modern-modal-bg">
      <div className="modern-modal">
        <h4>Actualizar estatus</h4>
        <div className="modern-modal-btns">
          <button
            className="btn-pendiente"
            onClick={() => onSelect("Pendiente")}
          >
            Pendiente
          </button>
          <button
            className="btn-entregado"
            onClick={() => onSelect("Entregado")}
          >
            Entregado
          </button>
          <button
            className="btn-rechazado"
            onClick={() => onSelect("Rechazado")}
          >
            Rechazado
          </button>
          <button
            className="btn-reprogramado"
            onClick={() => onSelect("Reprogramado")}
          >
            Reprogramado
          </button>
        </div>
        <button className="modern-modal-close" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

const ModalDetalle = ({ open, entrega, onClose, onUpdateEstatus, chofer }) => {
  const [showEstatus, setShowEstatus] = useState(false);
  if (!open || !entrega) return null;

  // Extraer lat/lng de la ubicación si existe
  let lat = null,
    lng = null;
  if (entrega.ubicacion) {
    const match = entrega.ubicacion.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      lat = parseFloat(match[1]);
      lng = parseFloat(match[2]);
    }
  }

  const handleEnviarDatos = () => {
    // Construcción del mensaje de entrega
    const mensaje = `Entrega para: ${entrega.cliente}\nFactura: ${entrega.factura}\nTeléfono: ${entrega.cel}\nUbicación: https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    // Verifica si el dispositivo es móvil o no
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const baseUrl = isMobile
      ? "https://wa.me/"
      : "https://web.whatsapp.com/send";

    // Usar el número del chofer de la entrega, o si no existe, el chofer global (React state)
    // Usar SIEMPRE el número del chofer global si existe
    let telefono =
      (typeof chofer !== "undefined" && (chofer.telefono || chofer.contacto)) ||
      "";

    // Limpiar el teléfono, eliminando caracteres no numéricos
    telefono = String(telefono).replace(/[^\d]/g, "");
    // Si el número comienza con '504' (código de país de Honduras), eliminarlo
    if (telefono.startsWith("504")) {
      telefono = telefono.slice(3);
    }

    // Verifica que el número tenga una longitud válida (8 dígitos)
    if (telefono.length !== 8) {
      alert("No hay un número de teléfono válido para WhatsApp del chofer");
      return;
    }

    // Construcción de la URL para abrir WhatsApp
    const url = `${baseUrl}?phone=504${telefono}&text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="modern-modal-bg">
      <div
        className="modern-modal modern-modal-detalle"
        style={{
          padding: "2rem",
          borderRadius: "12px",
          maxWidth: "600px",
          backgroundColor: "#fff",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
      >
        <h2 style={{ color: "#4f46e5", marginBottom: "1rem" }}>
          Detalle de Entrega
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            color: "#000",
          }}
        >
          <p>
            <strong>Cliente:</strong> {entrega.cliente}
          </p>
          <p>
            <strong>Factura:</strong> {entrega.factura}
          </p>
          <p>
            <strong>Teléfono:</strong> {entrega.cel}
          </p>
          <p>
            <strong>Artículo:</strong> {entrega.articulo}
          </p>
          <p>
            <strong>Fecha:</strong> {entrega.fecha}
          </p>
          <p>
            <strong>Fecha de Entrega:</strong> {entrega.fecha_entrega}
          </p>
          <p>
            <strong>Estatus:</strong>{" "}
            <span
              style={{
                color:
                  entrega.estatus === "Pendiente"
                    ? "#f59e0b"
                    : entrega.estatus === "Entregado"
                    ? "#10b981"
                    : "#ef4444",
              }}
            >
              {entrega.estatus}
            </span>
          </p>
        </div>
        {lat && lng && (
          <iframe
            title="Ubicación"
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: 12, marginTop: "1rem" }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyA4SuJGczpIN1YzyRVc0AFAo1nZ7ruhLaY&center=${lat},${lng}&zoom=16&maptype=satellite`}
          ></iframe>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1.5rem",
          }}
        >
          <button
            onClick={() => setShowEstatus(true)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#f59e0b",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Actualizar Estatus
          </button>
          <button
            onClick={handleEnviarDatos}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Enviar Datos
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>
        <ModalEstatus
          open={showEstatus}
          onClose={() => setShowEstatus(false)}
          onSelect={onUpdateEstatus}
        />
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
    lat: 16.3832884, // Coordenadas iniciales de Islas de la Bahía, Honduras
    lng: -86.4460626, // Coordenadas iniciales de Islas de la Bahía, Honduras
  });
  const [mapCenter, setMapCenter] = useState({
    lat: 16.3832884,
    lng: -86.4460626,
  }); // Coordenadas iniciales actualizadas
  const [mapLoaded, setMapLoaded] = useState(false);
  const [marker, setMarker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    if (
      open &&
      window.google &&
      window.google.maps &&
      mapRef.current &&
      !mapLoaded
    ) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 11.37, // Nivel de zoom inicial actualizado
        mapTypeId: "satellite", // Vista satélite
      });
      let localMarker = null;
      map.addListener("click", (e) => {
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
    }
  }, [open, mapLoaded, mapCenter]);

  React.useEffect(() => {
    if (!open) setMapLoaded(false);
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
      setError(
        "Todos los campos son obligatorios y debes seleccionar ubicación en el mapa."
      );
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
          lat: 16.3832884, // Restaurar coordenadas iniciales
          lng: -86.4460626, // Restaurar coordenadas iniciales
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
    <div className="modern-modal-bg">
      <div className="modern-modal modern-modal-agregar">
        <h4>Agregar entrega</h4>
        <div className="modern-detalle-list agregar-form-grid">
          <div className="agregar-form-col">
            <div className="input-group-float">
              <span className="input-icon"></span>
              <input
                type="text"
                value={form.cliente}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                onBlur={() => setTouched((t) => ({ ...t, cliente: true }))}
                required
                style={
                  touched.cliente && !form.cliente
                    ? { borderColor: "#ef4444" }
                    : {}
                }
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
                style={
                  touched.factura && !form.factura
                    ? { borderColor: "#ef4444" }
                    : {}
                }
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
                style={
                  touched.cel && !form.cel ? { borderColor: "#ef4444" } : {}
                }
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
                style={
                  touched.articulo && !form.articulo
                    ? { borderColor: "#ef4444" }
                    : {}
                }
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
                style={
                  touched.fecha && !form.fecha ? { borderColor: "#ef4444" } : {}
                }
              />
              <label className={form.fecha ? "active" : ""}>Fecha</label>
            </div>
            <div className="input-group-float">
              <span className="input-icon"></span>
              <input
                type="date"
                value={form.fecha_entrega}
                onChange={(e) =>
                  setForm({ ...form, fecha_entrega: e.target.value })
                }
                onBlur={() =>
                  setTouched((t) => ({ ...t, fecha_entrega: true }))
                }
                required
                style={
                  touched.fecha_entrega && !form.fecha_entrega
                    ? { borderColor: "#ef4444" }
                    : {}
                }
              />
              <label className={form.fecha_entrega ? "active" : ""}>
                Fecha de entrega
              </label>
            </div>
            <div className="input-group-float">
              <span className="input-icon"></span>
              <input
                type="text"
                value={form.ubicacion}
                readOnly
                required
                style={
                  touched.lat && touched.lng && (!form.lat || !form.lng)
                    ? { borderColor: "#ef4444" }
                    : {}
                }
              />
              <label className={form.ubicacion ? "active" : ""}>
                Ubicación (se selecciona en el mapa)
              </label>
            </div>
            {error && (
              <div style={{ color: "#ef4444", marginTop: 8 }}>{error}</div>
            )}
          </div>
          <div className="agregar-form-col">
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
          <button
            className="modern-cerrar"
            onClick={onClose}
            disabled={loading}
          >
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
  const [choferModal, setChoferModal] = useState(false);
  const [chofer, setChofer] = useState(null);
  const [user, setUser] = useState(null);
  const [filtroEstatus, setFiltroEstatus] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Obtener usuario autenticado
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, []);

  // Obtener entregas del usuario
  useEffect(() => {
    if (!user) return;
    const fetchEntregas = async () => {
      const { data, error } = await supabase
        .from("entregas_pendientes")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });
      if (!error) setEntregas(data || []);
    };
    fetchEntregas();
  }, [user]);

  // Obtener datos del chofer
  useEffect(() => {
    if (!user) return;
    const fetchChofer = async () => {
      const { data, error } = await supabase
        .from("choferes")
        .select("*")
        .eq("usuario_id", user.id)
        .single();
      if (!error) setChofer(data);
    };
    fetchChofer();
  }, [user]);

  // Filtrar entregas por estatus y búsqueda
  const entregasFiltradas = entregas.filter((e) => {
    const coincideEstatus = filtroEstatus ? e.estatus === filtroEstatus : true;
    const coincideBusqueda =
      e.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.factura.toLowerCase().includes(busqueda.toLowerCase());
    return coincideEstatus && coincideBusqueda;
  });

  // Actualizar estatus en Supabase
  const handleUpdateEstatus = async (nuevo) => {
    if (!detalle) return;
    await supabase
      .from("entregas_pendientes")
      .update({ estatus: nuevo })
      .eq("id", detalle.id);
    setEntregas(
      entregas.map((e) => (e.id === detalle.id ? { ...e, estatus: nuevo } : e))
    );
    setDetalle({ ...detalle, estatus: nuevo });
  };

  // Agregar nueva entrega a Supabase
  const handleAdd = async (nuevo) => {
    if (!user) return false;
    const { data, error } = await supabase
      .from("entregas_pendientes")
      .insert([
        {
          ...nuevo,
          usuario_id: user.id,
        },
      ])
      .select();
    if (error) {
    }
    if (!error && data && data.length > 0) {
      // Recargar lista desde supabase para evitar inconsistencias
      const { data: nuevas, error: err2 } = await supabase
        .from("entregas_pendientes")
        .select("*")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });
      if (!err2) setEntregas(nuevas || []);
      return true;
    }
    return error?.message || "No se pudo guardar la entrega. Intenta de nuevo.";
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
            .insert({
              nombre,
              telefono: contacto,

              usuario_id: user.id,
            })
            .select();
      if (error) throw error;
      if (data && data.length > 0) {
        setChofer(data[0]); // Actualizar el estado del chofer con los datos guardados
        alert("Datos del chofer guardados correctamente."); // Mostrar mensaje de confirmación
        setChoferModal(false); // Cerrar el modal
      }
    } catch (e) {
      console.error("Error al guardar los datos del chofer:", e.message);
      alert("Hubo un error al guardar los datos del chofer.");
    }
  };

  const handleChoferButtonClick = () => {
    if (chofer) {
      setChoferModal("detalle"); // Abrir modal de detalles si ya hay chofer
    } else {
      setChoferModal("formulario"); // Abrir formulario si no hay chofer
    }
  };

  return (
    <div className="entregas-modern-bg">
      <div className="entregas-modern-bar">
        <h2>Entregas pendientes</h2>
        <button className="modern-agregar" onClick={() => setShowAgregar(true)}>
          Agregar
        </button>
      </div>
      <div
        className="entregas-modern-filtros"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          className="filtros-estatus"
          style={{ display: "flex", gap: "0.5rem" }}
        >
          {estados.map((estatus) => (
            <button
              key={estatus}
              className={`filtro-boton ${
                filtroEstatus === estatus ? "activo" : ""
              }`}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                border:
                  filtroEstatus === estatus
                    ? "2px solid #6366f1"
                    : "1px solid #d1d5db",
                backgroundColor:
                  filtroEstatus === estatus ? "#e0e7ff" : "#f9fafb",
                color: filtroEstatus === estatus ? "#4f46e5" : "#374151",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onClick={() =>
                setFiltroEstatus(filtroEstatus === estatus ? "" : estatus)
              }
            >
              {estatus}
            </button>
          ))}
        </div>
        <div className="barra-busqueda" style={{ width: "50%" }}>
          <div style={{ position: "relative", width: "100%" }}>
            {/* Icono de búsqueda */}
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "1.1rem",
                color: "#9ca3af",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>

            {/* Input */}
            <input
              type="text"
              placeholder="Buscar por cliente o factura"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 1rem 0.65rem 2.5rem", // más espacio por el ícono
                borderRadius: "12px",
                border: "1.8px solid #e5e7eb",
                outline: "none",
                fontSize: "1rem",
                color: "#1e293b",
                background: "#f9fafb",
                boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.05)",
                transition: "all 0.25s ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
                e.target.style.boxShadow =
                  "0 0 0 3px rgba(99, 102, 241, 0.25), inset 0 1px 3px rgba(0, 0, 0, 0.05)";
                e.target.style.background = "#fff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.boxShadow =
                  "inset 0 1px 3px rgba(0, 0, 0, 0.05)";
                e.target.style.background = "#f9fafb";
              }}
            />
          </div>
        </div>
      </div>
      <div className="entregas-modern-table-wrap">
        <table className="entregas-modern-table">
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
            {entregasFiltradas.map((e, i) => (
              <tr key={e.id || i} onClick={() => setDetalle(e)}>
                <td data-label="Cliente">{e.cliente}</td>
                <td data-label="Factura">{e.factura}</td>
                <td data-label="Cel">{e.cel}</td>
                <td data-label="Artículo">{e.articulo}</td>
                <td data-label="Fecha">{e.fecha}</td>
                <td data-label="Fecha entrega">{e.fecha_entrega}</td>
                <td data-label="Tiempo">{tiempoTranscurrido(e.fecha)}</td>
                <td data-label="Estatus">
                  <span
                    className={`modern-status modern-${e.estatus?.toLowerCase?.()}`}
                  >
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
      {/* Botón flotante chofer */}
      <button
        className="chofer-fab"
        title="Datos de chofer"
        onClick={handleChoferButtonClick} // Usar la función correcta
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
      {choferModal === "detalle" && (
        <ChoferDetalleModal
          open={choferModal === "detalle"}
          chofer={chofer}
          onClose={() => setChoferModal(false)}
          onEdit={() => setChoferModal("formulario")}
        />
      )}
      {choferModal === "formulario" && (
        <ChoferModal
          open={choferModal === "formulario"}
          onClose={() => setChoferModal(false)}
          onSave={handleSaveChofer}
          chofer={chofer}
        />
      )}
    </div>
  );
};

export default Entregas;
