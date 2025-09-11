
import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { hashPassword } from "./utils/hash";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Permitir reset por uid (flujo personalizado)
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("uid");


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!password || password.length < 6) return setMsg("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) return setMsg("Las contraseñas no coinciden.");
    setLoading(true);
    if (!uid) {
      setMsg("No se pudo validar el usuario para resetear la contraseña.");
      setLoading(false);
      return;
    }
    // Actualizar la contraseña en profiles
    const hash = await hashPassword(password);
    const { error } = await supabase
      .from('profiles')
      .update({ contrasena: hash })
      .eq('id', uid);
    if (error) setMsg("Error al actualizar la contraseña: " + error.message);
    else {
      setMsg("¡Contraseña actualizada! Redirigiendo al login...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1800);
    }
    setLoading(false);
  };

  if (!uid) {
    return (
      <div style={{
        maxWidth: 400, margin: "40px auto", padding: 24, background: "#fff",
        borderRadius: 8, boxShadow: "0 2px 12px #0001", textAlign: "center"
      }}>
        <h2 style={{ color: "#d32f2f", marginBottom: 12 }}>No se pudo validar el usuario</h2>
        <p style={{ color: "#555", fontSize: 16 }}>
          El enlace de recuperación es inválido o falta el identificador de usuario.<br />
          Por seguridad, solicita un nuevo enlace desde la página de inicio de sesión.
        </p>
        <a href="/" style={{
          display: 'inline-block', marginTop: 18, padding: '10px 24px', background: '#1976d2', color: '#fff', borderRadius: 4, textDecoration: 'none', fontWeight: 'bold'
        }}>Ir al inicio de sesión</a>
      </div>
    );
  }

  return (
    <div style={{maxWidth:400,margin:"40px auto",padding:24,background:"#fff",borderRadius:8,boxShadow:"0 2px 12px #0001"}}>
      <h2>Restablecer contraseña</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{width:"100%",marginBottom:12,padding:8}}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          style={{width:"100%",marginBottom:12,padding:8}}
        />
        {msg && <div style={{color:msg.startsWith('¡')?"green":"red",marginBottom:8}}>{msg}</div>}
        <button type="submit" disabled={loading} style={{width:"100%",padding:10,background:'#1976d2',color:'#fff',border:'none',borderRadius:4}}>
          {loading ? "Actualizando..." : "Actualizar contraseña"}
        </button>
      </form>
    </div>
  );
}
