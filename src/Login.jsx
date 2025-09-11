import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import "./Login.css";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (isRegister) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setIsRegister(false);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else if (data.user) onLogin && onLogin(data.user);
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMsg("");
    if (!resetEmail) return setResetMsg("Ingresa tu correo electrónico");
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail);
    if (error) setResetMsg(error.message);
    else setResetMsg("Revisa tu correo para restablecer la contraseña.");
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-card">
          {showReset ? (
            <form className="login-form" onSubmit={handleResetPassword}>
              <h2>Recuperar contraseña</h2>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                />
              </div>
              {resetMsg && <div className="login-error">{resetMsg}</div>}
              <button type="submit" className="login-button">Enviar enlace</button>
              <div className="login-toggle">
                <button type="button" className="toggle-button" onClick={() => setShowReset(false)}>
                  Volver
                </button>
              </div>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <h2>{isRegister ? "Crear cuenta" : "Iniciar sesión"}</h2>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <div className="login-error">{error}</div>}
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Cargando..." : isRegister ? "Registrarse" : "Entrar"}
              </button>
              <div className="login-toggle" style={{marginBottom:8}}>
                <button type="button" className="toggle-button" onClick={() => setShowReset(true)}>
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="login-toggle">
                {isRegister ? (
                  <span>
                    ¿Ya tienes cuenta?{" "}
                    <button
                      type="button"
                      className="toggle-button"
                      onClick={() => setIsRegister(false)}
                    >
                      Inicia sesión
                    </button>
                  </span>
                ) : (
                  <span>
                    ¿No tienes cuenta?{" "}
                    <button
                      type="button"
                      className="toggle-button"
                      onClick={() => setIsRegister(true)}
                    >
                      Regístrate
                    </button>
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}