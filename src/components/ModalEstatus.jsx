
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import "./ModalEstatus.css";

const estados = ["Pendiente", "Entregado", "Rechazado", "Reprogramado"];
const tipos = ["TIENDA", "BODEGA SPS", "BODEGA TG", "DOMICILIO"];
const gestionadas = ["GESTIONADA", "NO GESTIONADA"];



const ModalEstatus = ({ open, onClose, entrega, fetchEntregas }) => {
  const [estatus, setEstatus] = useState(entrega?.estatus || "Pendiente");
  const [tipo, setTipo] = useState(entrega?.tipo_entrega || "TIENDA");
  const [gestionada, setGestionada] = useState(entrega?.gestionada || "NO GESTIONADA");
  const [fechaEntrega, setFechaEntrega] = useState(entrega?.fecha_entrega ? entrega.fecha_entrega.substring(0,10) : "");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  if (!open) return null;

  const handleGuardar = async () => {
    setLoading(true);
    setMsg("");
    try {
      const userId = entrega?.usuario_id;
      const registroId = entrega?.id;
      // Obtener usuario autenticado
      const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null;
      console.log("DEBUG update ModalEstatus:", {
        registroId,
        userId,
        authUserId: user?.id
      });
      if (!registroId || !userId) {
        setMsg("Faltan datos para actualizar.");
        setLoading(false);
        return;
      }
      // Construir el objeto de actualización
      const updateObj = { estatus, tipo_entrega: tipo, gestionada };
      if (estatus === "Reprogramado") {
        updateObj.fecha_entrega = fechaEntrega;
      }
      const { data, error } = await supabase
        .from("entregas_pendientes")
        .update(updateObj)
        .eq("id", registroId)
        .eq("usuario_id", userId)
        .select();
      if (error) {
        setMsg("Error: " + (error.message || error));
      } else if (!data || data.length === 0) {
        setMsg("No se actualizó ningún registro. Verifica permisos o datos.");
      } else {
        setMsg("¡Actualizado correctamente!");
        if (fetchEntregas) await fetchEntregas();
        setTimeout(() => {
          setMsg("");
          onClose();
        }, 900);
      }
    } catch (e) {
      setMsg("Error inesperado: " + (e.message || e));
    }
    setLoading(false);
  };

  return (
    <div className="modal-estatus-bg">
      <div className="modal-estatus">
        <h3>Actualizar estatus</h3>
        <div className="modal-estatus-group">
          <div className="modal-estatus-label">Estatus:</div>
          <div className="modal-estatus-btn-group">
            {estados.map(e => (
              <button
                key={e}
                type="button"
                className={`modal-estatus-btn${estatus === e ? ' selected' : ''}`}
                onClick={() => setEstatus(e)}
                style={{background: estatus === e ? '#6366f1' : '#e0e7ff', color: estatus === e ? '#fff' : '#3730a3'}}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        {estatus === "Reprogramado" && (
          <div className="modal-estatus-group">
            <div className="modal-estatus-label">Nueva fecha de entrega:</div>
            <input
              type="date"
              value={fechaEntrega}
              onChange={e => setFechaEntrega(e.target.value)}
              min={new Date().toISOString().substring(0,10)}
              className="modal-estatus-date"
            />
          </div>
        )}
        <div className="modal-estatus-group">
          <div className="modal-estatus-label">Tipo de entrega:</div>
          <div className="modal-estatus-btn-group">
            {tipos.map(e => (
              <button
                key={e}
                type="button"
                className={`modal-estatus-btn${tipo === e ? ' selected' : ''}`}
                onClick={() => setTipo(e)}
                style={{background: tipo === e ? '#6366f1' : '#e0e7ff', color: tipo === e ? '#fff' : '#3730a3'}}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="modal-estatus-group">
          <div className="modal-estatus-label">Gestionada:</div>
          <div className="modal-estatus-btn-group">
            {gestionadas.map(e => (
              <button
                key={e}
                type="button"
                className={`modal-estatus-btn${gestionada === e ? ' selected' : ''}`}
                onClick={() => setGestionada(e)}
                style={{background: gestionada === e ? '#6366f1' : '#e0e7ff', color: gestionada === e ? '#fff' : '#3730a3'}}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        {msg && <div style={{margin:'8px 0', color: msg.startsWith('¡') ? '#22c55e' : '#ef4444'}}>{msg}</div>}
        <div className="modal-estatus-actions">
          <button onClick={onClose} disabled={loading}>Cancelar</button>
          <button onClick={handleGuardar} disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
};

export default ModalEstatus;
