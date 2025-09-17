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
      const hash = await hashPassword(password);
      const id = uuidv4();
      const { data, error } = await supabase.from("profiles").insert({
        id,
        identidad,
        telefono,
        email,
        nombre,
        mi_tienda: miTienda,
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
                <select value={miTienda} onChange={e => setMiTienda(e.target.value)} required>
                  <option value="">Selecciona tu tienda</option>
                  {tiendas.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
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
