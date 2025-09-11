import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Obtener los tokens del hash de la URL
  const params = new URLSearchParams(window.location.hash.replace('#', '?'));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  useEffect(() => {
    // Si hay tokens, establecer la sesión de recuperación
    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    }
  }, [accessToken, refreshToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!password || password.length < 6) return setMsg("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) return setMsg("Las contraseñas no coinciden.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setMsg(error.message);
    else {
      setMsg("¡Contraseña actualizada! Redirigiendo al login...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1800);
    }
    setLoading(false);
  };

  if (!accessToken) {
    return <div style={{padding:32}}>Enlace inválido o expirado.</div>;
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
