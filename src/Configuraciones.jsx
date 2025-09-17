import React, { useState, useEffect } from "react";
import "./Configuraciones.css";
import { FaCheckCircle } from "react-icons/fa";

import { useProfile } from "./hooks/useProfile";
import { comparePassword } from "./utils/hash";
import { supabase } from "./supabaseClient";

const campos = [
  { key: "nombre", label: "Nombre" },
  { key: "email", label: "Email" },
  { key: "telefono", label: "Teléfono" },
];

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

const PASSWORD_KEY = "password";

export default function Configuraciones() {
  const userId = localStorage.getItem("userId");
  const { profile: user, setProfile: setUser, loading: loadingProfile, error: errorProfile, fetchProfile, updateProfile } = useProfile();
  const [modal, setModal] = useState({ open: false, campo: null, valor: "" });
  const [passwordModal, setPasswordModal] = useState({
    open: false,
    campo: null,
    valor: "",
    nuevoValor: "",
  });
  const [passwordChangeModal, setPasswordChangeModal] = useState({ open: false, newPassword: "", confirmPassword: "" });
  const [passwordChangeConfirmModal, setPasswordChangeConfirmModal] = useState({ open: false, password: "", newPassword: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  // Leer perfil al montar
  useEffect(() => {
    if (userId) fetchProfile(userId);
  }, [userId, fetchProfile]);

  if (loadingProfile || !user) {
    return <div style={{textAlign:'center',marginTop:40}}>Cargando datos de usuario...</div>;
  }
  // Abrir modal para verificar contraseña antes de resetear
  const openPasswordChangeModal = () => {
    setPasswordChangeConfirmModal({ open: true, password: "", newPassword: "" });
    setError("");
  };

  // Guardar nueva contraseña y pedir contraseña actual
  const handlePasswordChangeSave = (e) => {
    e.preventDefault();
    if (passwordChangeModal.newPassword.length < 6) {
      setError("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (passwordChangeModal.newPassword !== passwordChangeModal.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setPasswordChangeModal({ open: false, newPassword: "", confirmPassword: "" });
    setPasswordChangeConfirmModal({ open: true, password: "", newPassword: passwordChangeModal.newPassword });
    setError("");
  };

  // Confirmar contraseña actual y actualizar
  const handlePasswordChangeConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!passwordChangeConfirmModal.password) {
      setError("Debes ingresar tu contraseña actual para continuar.");
      setLoading(false);
      return;
    }
    // Buscar el hash de la contraseña en profiles
    const { data: profileWithPass, error } = await supabase
      .from("profiles")
      .select("id, contrasena, email")
      .eq("id", userId)
      .maybeSingle();
    if (error || !profileWithPass) {
      setError("Error al validar usuario.");
      setLoading(false);
      return;
    }
    const match = await comparePassword(passwordChangeConfirmModal.password, profileWithPass.contrasena);
    if (!match) {
      setError("Contraseña incorrecta.");
      setLoading(false);
      return;
    }
    setPasswordChangeConfirmModal({ open: false, password: "", newPassword: "" });
    setLoading(false);
    // Redirigir a la página de reset password con el uid
    window.location.href = `/reset-password?uid=${userId}`;
  };

  // Open modal to edit field
  const openEditModal = (campo) => {
    setModal({ open: true, campo, valor: user[campo] });
    setError("");
  };

  // Save new value and prompt for password
  const handleEditSave = (e) => {
    e.preventDefault();
    setModal({ open: false, campo: null, valor: "" });
    setPasswordModal({
      open: true,
      campo: modal.campo,
      valor: "",
      nuevoValor: modal.valor,
    });
    setError("");
  };

  // Confirm password and update
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!passwordModal.valor) {
      setError("Debes ingresar tu contraseña para guardar los cambios.");
      setLoading(false);
      return;
    }
    // Buscar el hash de la contraseña en profiles
    const { data: profileWithPass, error } = await supabase
      .from("profiles")
      .select("id, contrasena, email")
      .eq("id", userId)
      .maybeSingle();
    if (error || !profileWithPass) {
      setError("Error al validar usuario.");
      setLoading(false);
      return;
    }
    const match = await comparePassword(passwordModal.valor, profileWithPass.contrasena);
    if (!match) {
      setError("Contraseña incorrecta.");
      setLoading(false);
      return;
    }
    // Actualizar dato en Supabase
    const ok = await updateProfile(userId, { [passwordModal.campo]: passwordModal.nuevoValor });
    if (!ok) {
      setError("Error al actualizar. Intenta de nuevo.");
      setLoading(false);
      return;
    }
    setPasswordModal({ open: false, campo: null, valor: "", nuevoValor: "" });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  // Close modals
  const closeModals = () => {
    setModal({ open: false, campo: null, valor: "" });
    setPasswordModal({ open: false, campo: null, valor: "", nuevoValor: "" });
    setPasswordChangeModal({ open: false, newPassword: "", confirmPassword: "" });
    setPasswordChangeConfirmModal({ open: false, password: "", newPassword: "" });
    setError("");
  };

  if (success) {
    return (
      <div className="config-success-screen">
        <FaCheckCircle className="icon" />
        <h2>¡Actualización exitosa!</h2>
        <div>Los datos se han actualizado correctamente.</div>
      </div>
    );
  }

  return (
    <div className="config-user-cards">
      <h2 style={{textAlign: 'center', marginBottom: 18, color: '#1976d2', fontWeight: 700}}>Datos del usuario</h2>
      {campos.map(({ key, label }) => (
        <div className="config-user-card" key={key}>
          <div className="label">{label}</div>
          <div className="value">{user[key]}</div>
          <button className="update-btn" onClick={() => openEditModal(key)}>
            Actualizar datos
          </button>
        </div>
      ))}


      {/* Card para actualizar mi_tienda */}
      <div className="config-user-card" key="mi_tienda">
        <div className="label">Mi tienda</div>
        <div className="value">{user.mi_tienda || <span style={{color:'#888'}}>No asignada</span>}</div>
        <button className="update-btn" onClick={() => setModal({ open: true, campo: 'mi_tienda', valor: user.mi_tienda || '' })}>
          Actualizar tienda
        </button>
      </div>

      {/* Card para cambiar contraseña */}
      <div className="config-user-card" key="password">
        <div className="label">Contraseña</div>
        <div className="value">********</div>
        <button className="update-btn" onClick={openPasswordChangeModal}>
          Cambiar contraseña
        </button>
      </div>


      {/* Modal para confirmar contraseña actual al cambiar contraseña */}
      {passwordChangeConfirmModal.open && (
        <div className="config-modal-bg" onClick={closeModals}>
          <div className="config-modal" onClick={e => e.stopPropagation()}>
            <h3>Confirma tu contraseña actual</h3>
            <form onSubmit={handlePasswordChangeConfirm}>
              <input
                type="password"
                placeholder="Contraseña actual"
                value={passwordChangeConfirmModal.password}
                onChange={e => setPasswordChangeConfirmModal(m => ({ ...m, password: e.target.value }))}
                required
              />
              {error && <div className="form-error">{error}</div>}
              <div className="modal-btns">
                <button className="modal-btn" type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar"}
                </button>
                <button className="modal-btn cancel" type="button" onClick={closeModals} disabled={loading}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for editing field */}
      {modal.open && (
        <div className="config-modal-bg" onClick={closeModals}>
          <div className="config-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Actualizar {modal.campo === 'mi_tienda' ? 'Mi tienda' : campos.find((c) => c.key === modal.campo)?.label}</h3>
            <form onSubmit={handleEditSave}>
              {modal.campo === 'mi_tienda' ? (
                <select
                  autoFocus
                  value={modal.valor}
                  onChange={e => setModal(m => ({ ...m, valor: e.target.value }))}
                  required
                >
                  <option value="">Selecciona tu tienda</option>
                  {tiendas.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              ) : (
                <input
                  autoFocus
                  value={modal.valor}
                  onChange={e => setModal(m => ({ ...m, valor: e.target.value }))}
                  required
                />
              )}
              <div className="modal-btns">
                <button className="modal-btn" type="submit">
                  Continuar
                </button>
                <button
                  className="modal-btn cancel"
                  type="button"
                  onClick={closeModals}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for password confirmation */}
      {passwordModal.open && (
        <div className="config-modal-bg" onClick={closeModals}>
          <div className="config-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirma tu contraseña</h3>
            <form onSubmit={handlePasswordSave}>
              <input
                type="password"
                placeholder="Contraseña"
                value={passwordModal.valor}
                onChange={(e) =>
                  setPasswordModal((m) => ({ ...m, valor: e.target.value }))
                }
                required
              />
              {error && <div className="form-error">{error}</div>}
              <div className="modal-btns">
                <button className="modal-btn" type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar"}
                </button>
                <button
                  className="modal-btn cancel"
                  type="button"
                  onClick={closeModals}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}