import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { FaUser, FaFileInvoice, FaPhone, FaBox, FaMapMarkerAlt, FaTruck, FaClipboardCheck, FaCalendar, FaSave } from "react-icons/fa";
import "../ModalesNew.css";
import "./ActualizarDatosModal.css";

const tipos = ["TIENDA", "BODEGA SPS", "BODEGA TG", "DOMICILIO"];
const gestionadas = ["GESTIONADA", "NO GESTIONADA"];

const ActualizarDatosModal = ({ open, entrega, onClose, onUpdated }) => {
  const [cliente, setCliente] = useState(entrega?.cliente || "");
  const [factura, setFactura] = useState(entrega?.factura || "");
  const [cel, setCel] = useState(entrega?.cel || "");
  const [articulo, setArticulo] = useState(entrega?.articulo || "");
  const [ubicacion, setUbicacion] = useState(entrega?.ubicacion || "");
  const [tipoEntrega, setTipoEntrega] = useState(entrega?.tipo_entrega || "TIENDA");
  const [gestionada, setGestionada] = useState(entrega?.gestionada || "NO GESTIONADA");
  const [fechaEntrega, setFechaEntrega] = useState(
    entrega?.fecha_entrega ? entrega.fecha_entrega.substring(0, 10) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !entrega) return null;

  const handleSave = async () => {
    setLoading(true);
    setError("");
    
    if (!cliente || !factura) {
      setError("Cliente y Factura son campos obligatorios");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("entregas_pendientes")
        .update({
          cliente,
          factura,
          cel,
          articulo,
          ubicacion,
          tipo_entrega: tipoEntrega,
          gestionada,
          fecha_entrega: fechaEntrega
        })
        .eq("id", entrega.id);

      if (updateError) throw updateError;
      
      if (typeof onUpdated === "function") {
        await onUpdated();
      }
      
      onClose();
    } catch (e) {
      setError(e.message || "Error al actualizar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleUbicacionActual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const nuevaUbicacion = `https://www.google.com/maps/@${latitude},${longitude},17z`;
          setUbicacion(nuevaUbicacion);
        },
        (error) => {
          alert("Error al obtener ubicación: " + error.message);
        }
      );
    } else {
      alert("Geolocalización no disponible en este navegador");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container modal-actualizar-datos">
        <button className="modal-close-btn-new" onClick={onClose}>×</button>
        
        {/* Header */}
        <div className="actualizar-datos-header">
          <div className="actualizar-datos-icon-wrapper">
            <FaFileInvoice />
          </div>
          <div>
            <h2 className="actualizar-datos-title">Editar Entrega</h2>
            <p className="actualizar-datos-subtitle">Modifica los datos de la entrega #{entrega.factura}</p>
          </div>
        </div>

        {/* Body */}
        <div className="actualizar-datos-body">
          {/* Sección: Información Básica */}
          <div className="form-section">
            <div className="form-section-title">
              <div className="form-section-icon">📄</div>
              Información básica
            </div>
            
            <div className="form-grid">
              {/* Cliente */}
              <div className="form-field">
                <label className="form-field-label">
                  <FaUser /> Cliente <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>

              {/* Factura */}
              <div className="form-field">
                <label className="form-field-label">
                  <FaFileInvoice /> Factura <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  value={factura}
                  onChange={(e) => setFactura(e.target.value)}
                  placeholder="Número de factura"
                />
              </div>

              {/* Teléfono */}
              <div className="form-field">
                <label className="form-field-label">
                  <FaPhone /> Teléfono
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  value={cel}
                  onChange={(e) => setCel(e.target.value)}
                  placeholder="Número de teléfono"
                />
              </div>

              {/* Artículo */}
              <div className="form-field form-field-full">
                <label className="form-field-label">
                  <FaBox /> Artículo
                </label>
                <input
                  type="text"
                  className="form-field-input"
                  value={articulo}
                  onChange={(e) => setArticulo(e.target.value)}
                  placeholder="Descripción del artículo"
                />
              </div>
            </div>
          </div>

          {/* Sección: Detalles de Entrega */}
          <div className="form-section">
            <div className="form-section-title">
              <div className="form-section-icon">🚚</div>
              Detalles de entrega
            </div>
            
            <div className="form-grid">
              {/* Fecha de entrega */}
              <div className="form-field form-field-full">
                <label className="form-field-label">
                  <FaCalendar /> Fecha de entrega
                </label>
                <input
                  type="date"
                  className="form-field-input"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                />
              </div>

              {/* Tipo de entrega */}
              <div className="form-field form-field-full">
                <label className="form-field-label">
                  <FaTruck /> Tipo de entrega
                </label>
                <div className="button-group">
                  {tipos.map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setTipoEntrega(tipo)}
                      className={`option-btn ${tipoEntrega === tipo ? 'active' : ''}`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gestionada */}
              <div className="form-field form-field-full">
                <label className="form-field-label">
                  <FaClipboardCheck /> Gestión
                </label>
                <div className="button-group">
                  {gestionadas.map((gest) => (
                    <button
                      key={gest}
                      type="button"
                      onClick={() => setGestionada(gest)}
                      className={`option-btn ${gestionada === gest ? 'active' : ''}`}
                    >
                      {gest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Ubicación */}
          <div className="form-section">
            <div className="form-section-title">
              <div className="form-section-icon">📍</div>
              Ubicación
            </div>
            
            <div className="form-field">
              <label className="form-field-label">
                <FaMapMarkerAlt /> URL de Google Maps
              </label>
              <div className="input-with-button">
                <input
                  type="text"
                  className="form-field-input"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  placeholder="Pega aquí la URL de Google Maps"
                />
                <button
                  type="button"
                  onClick={handleUbicacionActual}
                  className="btn-get-location"
                  title="Obtener mi ubicación actual"
                >
                  📍 Mi ubicación
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="actualizar-datos-error">
            ⚠️ {error}
          </div>
        )}

        {/* Footer */}
        <div className="actualizar-datos-footer">
          <button 
            className="btn-footer btn-cancel" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            className="btn-footer btn-save" 
            onClick={handleSave}
            disabled={loading || !cliente || !factura}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Guardando...
              </>
            ) : (
              <>
                <FaSave />
                Guardar cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActualizarDatosModal;
