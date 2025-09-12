import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import "./Login.css";
import { hashPassword, comparePassword } from "./utils/hash";
import { v4 as uuidv4 } from "uuid";
import useProfileByEmail from "./hooks/useProfileByEmail";

export default function Login({ onLogin }) {
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
      // Hashear la contraseña antes de guardar
      const hash = await hashPassword(password);
      const id = uuidv4();
      console.log('Intentando registrar usuario:', { id, identidad, telefono, email, nombre, contrasena: hash });
      const { data, error } = await supabase.from("profiles").insert({
        id,
        identidad,
        telefono,
        email,
        nombre,
        contrasena: hash
      });
      if (error) {
        console.error('Error Supabase:', error);
        setError("Error al crear usuario: " + error.message);
      } else setIsRegister(false);
    } else {
      // Login: buscar usuario por email usando el hook
      const profile = await fetchProfileLogin();
      if (!profile) {
        setError("Usuario o contraseña incorrectos");
        setLoading(false);
        return;
      }
      // El hook no trae la contraseña, así que hay que pedirla
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
      // Guardar sesión simple (puedes mejorar esto con JWT o context)
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
    // Usar el hook para buscar el perfil
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
    // Redirigir a página de reset
    window.location.href = "/reset-password?uid=" + profile.id;
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
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Número de identidad"
                  value={resetIdentidad}
                  onChange={e => setResetIdentidad(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Número de teléfono"
                  value={resetTelefono}
                  onChange={e => setResetTelefono(e.target.value)}
                  required
                />
              </div>
              {resetMsg && <div className="login-error">{resetMsg}</div>}
              <button type="submit" className="login-button">Validar datos</button>
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
              {isRegister && (
                <>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Un nombre y un apellido"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Número de identidad"
                      value={identidad}
                      onChange={e => setIdentidad(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Número de teléfono"
                      value={telefono}
                      onChange={e => setTelefono(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
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