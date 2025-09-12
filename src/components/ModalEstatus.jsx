
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
      const { data, error } = await supabase
        .from("entregas_pendientes")
        .update({ estatus, tipo_entrega: tipo, gestionada })
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
        <label>
          Estatus:
          <select value={estatus} onChange={e => setEstatus(e.target.value)}>
            {estados.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label>
          Tipo de entrega:
          <select value={tipo} onChange={e => setTipo(e.target.value)}>
            {tipos.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <label>
          Gestionada:
          <select value={gestionada} onChange={e => setGestionada(e.target.value)}>
            {gestionadas.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
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
