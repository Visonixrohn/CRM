import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [sessionError, setSessionError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Obtener los tokens del hash de la URL
  const params = new URLSearchParams(window.location.hash.replace('#', '?'));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  useEffect(() => {
    let ignore = false;
    async function setRecoverySession() {
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!ignore && error) setSessionError(true);
      }
    }
    setRecoverySession();
    return () => { ignore = true; };
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

  if (!accessToken || sessionError) {
    return (
      <div style={{
        maxWidth: 400, margin: "40px auto", padding: 24, background: "#fff",
        borderRadius: 8, boxShadow: "0 2px 12px #0001", textAlign: "center"
      }}>
        <h2 style={{ color: "#d32f2f", marginBottom: 12 }}>No se pudo validar el enlace</h2>
        <p style={{ color: "#555", fontSize: 16 }}>
          El enlace de recuperación es inválido, expiró, ya fue utilizado o falta la sesión de autenticación.<br />
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
