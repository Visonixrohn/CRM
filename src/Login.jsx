import React, { useState } from "react";
// Componente de estrellas animadas inclinadas
function StarBgAnimado() {
  // Generar 40 estrellas con posiciones y delays aleatorios
  const stars = Array.from({ length: 40 }).map((_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 2.5;
    const size = Math.random() * 1.5 + 1.5;
    return (
      <div
        key={i}
        className="star"
        style={{
          left: `${left}%`,
          bottom: '-10px',
          width: `${size}px`,
          height: `${size}px`,
          animationDelay: `${delay}s`,
        }}
      />
    );
  });
  return <div className="star-bg-animado">{stars}</div>;
}
import { supabase } from "./supabaseClient";
import "./Login.css";
import "./StarBgAnimado.css";
import { hashPassword, comparePassword } from "./utils/hash";
import { v4 as uuidv4 } from "uuid";
import useProfileByEmail from "./hooks/useProfileByEmail";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [identidad, setIdentidad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [nombre, setNombre] = useState("");
  const [miTienda, setMiTienda] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetIdentidad, setResetIdentidad] = useState("");
  const [resetTelefono, setResetTelefono] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const tiendas = [
    "C1C 1A. CALLE",
    "CAL ALTARA SPS",
    "CAP AEROPLAZA",
    "CBL BELEN",
    "CCB CEIBA",
    "CCH CHOLUTECA",
    "CCM CITY MALL SPS",
    "CCO COMAYAGUA CENTRO",
    "CCT CENTRAL TEGUCIGALPA",
    "CCV CIRCUNVALACION SPS",
    "CCY CITY MALL TEG",
    "CDN DANLI",
    "CEP EL PARAISO",
    "CES LA ESPERANZA",
    "CJT JUTICALPA",
    "CKN KENNEDY",
    "CLC MALL LAS CASCADAS",
    "CLE LA ENTRADA COPAN",
    "CLL LAS LOMAS",
    "CLM CHOLOMA",
    "CLP LOS PROCERES",
    "CLR LARACH",
    "CMC MEGAPLAZA CEIBA",
    "CME MEGAPLAZA EL PROGRESO",
    "CMF MIRAFLORES",
    "CMG MEGA MALL SPS",
    "CMJ MALL PREMIER JUTICALPA",
    "CMP MALL PREMIER",
    "CNA NACAOME",
    "COL OLANCHITO",
    "CPA LA PAZ",
    "CPC PUERTO CORTES",
    "CPP PLAZA PREMIER",
    "CPR PROGRESO",
    "CPZ PLAZA 105",
    "CRT ROATAN",
    "CSB SANTA BARBARA",
    "CSG SIGUATEPEQUE",
    "CSI SAN ISIDRO",
    "CSL SAN LORENZO",
    "CSR SANTA ROSA DE COPAN",
    "CTC CATACAMAS",
    "CTL TELA",
    "CTO TOCOA",
    "CUC UNIMALL CHOLUTECA",
    "CVL VILLANUEVA",
    "FSB CASH SANTA BARBARA",
    "LOP OFICINA PRINCIPAL USADOS",
    "OAL ALTARA SPS",
    "OCC CIRCUNVALACION SPS",
    "OCM MALL PREMIER COMAYAGUA",
    "OCS CITY MALL SPS",
    "OCY CITY MALL TEG",
    "OGV GALERIA DEL VALLE",
    "OLC MALL LAS CASCADAS",
    "OLL LAS LOMAS",
    "OMC MEGAPLAZA CEIBA",
    "OMF MIRAFLORES",
    "OMG MEGA MALL SPS",
    "OMJ MALL PREMIER JUTICALPA",
    "OMM METRO MALL",
    "OMP MALL PREMIER TG",
    "OPR EL PROGRESO",
    "OSR SANTA ROSA DE COPAN",
    "OUM UNIMALL CHOLUTECA",
    "RAL ALTARA SPS",
    "RCC CIRCUNVALACION SPS",
    "RCD CORNER DANLI",
    "RCM CITY MALL SPS",
    "RCP CORNER CORTES",
    "RCT CENTRO",
    "RCY CITY MALL TEG",
    "RLC MALL LAS CASCADAS",
    "RLL LAS LOMAS",
    "RMC MEGAPLAZA CEIBA",
    "RMF MIRAFLORES",
    "RMG MEGA MALL SPS",
    "RMM METRO MALL TEG",
    "RMP MULTIPLAZA S.P.S.",
    "RMT MALL MULTIPLAZA TEGA.",
    "RPC MALL PREMIER COMAYAGUA",
    "RPM MALL PREMIER",
    "RPZ PLAZA 105",
    "RSC HN AVE SAN ISIDRO CEIBA",
    "RUC UNIMALL CHOLUTECA",
    "T2A SEGUNDA AVENIDA",
    "TCB CEIBA",
    "TCC CATACAMAS",
    "TCH CHOLUTECA",
    "TCM COMAYAGUA",
    "TCT BELEN",
    "TCT CENTRAL TEGUCIGALPA",
    "TDL DANLI",
    "TEP EL PARAISO",
    "TGC GRAN CENTRAL METROPOLITANA",
    "TGR GRACIAS",
    "TJN JUNIOR",
    "TJT JUTICALPA",
    "TLE LA ENTRADA COPAN",
    "TLM CHOLOMA",
    "TMC TROPIMOTORS CEIBA",
    "TMD TROPIMOTORS DANLI",
    "TME TROPIMOTORS PROGRESO",
    "TMF MIRAFLORES",
    "TMG TROPIMOTORS MEGA MALL SPS",
    "TMO TROPIMOTORS SAN MARCOS OCOTEPEQUE",
    "TMP MALL PREMIER",
    "TMV TROPIMOTORS VILLANUEVA",
    "TNA NACAOME",
    "TOL OLANCHITO",
    "TPC TROPIMOTORS PUERTO CORTES",
    "TPR PROGRESO",
    "TPS PLAZA DEL SOL",
    "TPT TROPIMOTORS TOCOA",
    "TSC SANTA CRUZ",
    "TSF SANTA FE",
    "TSG SIGUATEPEQUE",
    "TSL SAN LORENZO",
    "TSM SAN MIGUEL",
    "TSO SAN MARCOS OCOTEPEQUE",
    "TSR SANTA ROSA",
    "TSS TROPIMOTORS SANTA ROSA DE COPAN",
    "TSY SUYAPA",
    "TTG TALANGA",
    "TTL TELA",
    "TVL VILLANUEVA"
  ];

  const { fetchProfile: fetchProfileLogin } = useProfileByEmail(email);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (isRegister) {
      if (!identidad || !telefono || !nombre || !miTienda || !email || !password) {
        setError("Debes ingresar todos los campos, incluyendo tienda");
        setLoading(false);
        return;
      }
      // Hashear la contraseña antes de guardar
      const hash = await hashPassword(password);
      const id = uuidv4();
      const { data, error } = await supabase.from("profiles").insert({
        id,
        identidad,
        telefono,
        email,
        nombre,
        mi_tienda: miTienda,
        contrasena: hash,
        rol: "usuario",
        acceso: "permitido"
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
        .select("id, contrasena, email, identidad, telefono, nombre, acceso, rol")
        .eq("email", email.trim())
        .maybeSingle();
      if (error || !profileWithPass) {
        setError("Usuario o contraseña incorrectos");
        setLoading(false);
        return;
      }
      if (profileWithPass.acceso !== "permitido") {
        setError("Tu acceso ha sido restringido. Contacta al administrador.");
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
      <div className="login-split-container">
        <div className="login-left">
          <div className="login-card">
            {showReset ? (
              <form className="login-form" onSubmit={handleResetPassword}>
                <img src="https://i.imgur.com/qUoDoR7.png" alt="Logo" style={{ width: '120px', display: 'block', margin: '0 auto 16px auto' }} />
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
                <img src="https://i.imgur.com/qUoDoR7.png" alt="Logo" style={{ width: '120px', display: 'block', margin: '0 auto 16px auto' }} />
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
                  <div className="input-group">
                    <select
                      value={miTienda}
                      onChange={e => setMiTienda(e.target.value)}
                      required
                    >
                      <option value="">Selecciona tu tienda</option>
                      {tiendas.map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>
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
        <div className="login-right">
          <div className="login-bg-animado"></div>
          <StarBgAnimado />
        </div>
      </div>
    </div>
  );
}

export default Login;
