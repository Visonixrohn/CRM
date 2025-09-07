import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./Login.css";

export default function Login({ onLogin }) {
  // Estado y lógica para el prompt de instalación PWA
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowInstall(false);
    }
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

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

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="login-card">
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
            {/* Botón para instalar la app como PWA */}
            {showInstall && (
              <button
                type="button"
                style={{
                  marginTop: 16,
                  background: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 18px',
                  fontSize: '1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
                  cursor: 'pointer',
                }}
                onClick={handleInstallClick}
              >
                Instalar aplicación
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
