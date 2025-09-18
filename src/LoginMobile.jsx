import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import "./LoginMobile.css";
import { hashPassword, comparePassword } from "./utils/hash";
import { v4 as uuidv4 } from "uuid";
import useProfileByEmail from "./hooks/useProfileByEmail";

function LoginMobile({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [identidad, setIdentidad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetIdentidad, setResetIdentidad] = useState("");
  const [resetTelefono, setResetTelefono] = useState("");
  const [resetMsg, setResetMsg] = useState("");

  const { fetchProfile: fetchProfileLogin } = useProfileByEmail(email);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (isRegister) {
      if (!identidad || !telefono || !nombre) {
        setError("Debes ingresar nombre, número de identidad y teléfono");
        setLoading(false);
        return;
      }
      const hash = await hashPassword(password);
      const id = uuidv4();
      const { data, error } = await supabase.from("profiles").insert({
        id,
        identidad,
        telefono,
        email,
        nombre,
        contrasena: hash
      });
      if (error) {
        setError("Error al crear usuario: " + error.message);
      } else setIsRegister(false);
    } else {
      const profile = await fetchProfileLogin();
      if (!profile) {
        setError("Usuario o contraseña incorrectos");
        setLoading(false);
        return;
      }
      const { data: profileWithPass, error } = await supabase
        .from("profiles")
        .select("id, contrasena, email, identidad, telefono, nombre")
        .eq("email", email.trim())
        .maybeSingle();
      if (error || !profileWithPass) {
        setError("Usuario o contraseña incorrectos");
        setLoading(false);
        return;
      }
      const match = await comparePassword(password, profileWithPass.contrasena);
      if (!match) {
        setError("Usuario o contraseña incorrectos");
        setLoading(false);
        return;
      }
      localStorage.setItem("userId", profileWithPass.id);
      if (profileWithPass.nombre) {
        localStorage.setItem("nombre", profileWithPass.nombre);
      }
      onLogin && onLogin(profileWithPass);
    }
    setLoading(false);
  };

  const { fetchProfile } = useProfileByEmail(resetEmail);
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMsg("");
    if (!resetEmail || !resetIdentidad || !resetTelefono) {
      setResetMsg("Completa todos los campos");
      return;
    }
    const profile = await fetchProfile();
    if (!profile) {
      setResetMsg("No existe un usuario con ese correo");
      return;
    }
    if (
      profile.identidad !== resetIdentidad.trim() ||
      profile.telefono !== resetTelefono.trim()
    ) {
      setResetMsg("Los datos no coinciden");
      return;
    }
    window.location.href = "/reset-password?uid=" + profile.id;
  };

  return (
    <div className="login-mobile-bg">
      <div className="login-mobile-card">
        {showReset ? (
          <form className="login-mobile-form" onSubmit={handleResetPassword}>
            <img src="https://i.imgur.com/qUoDoR7.png" alt="Logo" className="login-mobile-logo" />
            <h2>Recuperar contraseña</h2>
            <input type="email" placeholder="Correo electrónico" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
            <input type="text" placeholder="Número de identidad" value={resetIdentidad} onChange={e => setResetIdentidad(e.target.value)} required />
            <input type="text" placeholder="Número de teléfono" value={resetTelefono} onChange={e => setResetTelefono(e.target.value)} required />
            {resetMsg && <div className="login-mobile-error">{resetMsg}</div>}
            <button type="submit" className="login-mobile-button">Validar datos</button>
            <button type="button" className="login-mobile-toggle" onClick={() => setShowReset(false)}>
              Volver
            </button>
          </form>
        ) : (
          <form className="login-mobile-form" onSubmit={handleSubmit}>
            <img src="https://i.imgur.com/qUoDoR7.png" alt="Logo" className="login-mobile-logo" />
            <h2>{isRegister ? "Crear cuenta" : "Iniciar sesión"}</h2>
            <input type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} required />
            {isRegister && (
              <>
                <input type="text" placeholder="Un nombre y un apellido" value={nombre} onChange={e => setNombre(e.target.value)} required />
                <input type="text" placeholder="Número de identidad" value={identidad} onChange={e => setIdentidad(e.target.value)} required />
                <input type="text" placeholder="Número de teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} required />
              </>
            )}
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <div className="login-mobile-error">{error}</div>}
            <button type="submit" className="login-mobile-button" disabled={loading}>
              {loading ? "Cargando..." : isRegister ? "Registrarse" : "Entrar"}
            </button>
            <button type="button" className="login-mobile-toggle" onClick={() => setShowReset(true)}>
              ¿Olvidaste tu contraseña?
            </button>
            <div className="login-mobile-toggle-group">
              {isRegister ? (
                <span>
                  ¿Ya tienes cuenta?{' '}
                  <button type="button" className="login-mobile-toggle" onClick={() => setIsRegister(false)}>
                    Inicia sesión
                  </button>
                </span>
              ) : (
                <span>
                  ¿No tienes cuenta?{' '}
                  <button type="button" className="login-mobile-toggle" onClick={() => setIsRegister(true)}>
                    Regístrate
                  </button>
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginMobile;
