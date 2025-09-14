import React, { useState, useEffect } from "react";
import "./Configuraciones.css";
import { FaCheckCircle } from "react-icons/fa";

import { useProfile } from "./hooks/useProfile";
import { supabase } from "./supabaseClient";

const campos = [
  { key: "nombre", label: "Nombre" },
  { key: "email", label: "Email" },
  { key: "telefono", label: "Teléfono" },
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
  // Abrir modal para cambiar contraseña
  const openPasswordChangeModal = () => {
    setPasswordChangeModal({ open: true, newPassword: "", confirmPassword: "" });
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
    await new Promise((r) => setTimeout(r, 1200));
    if (!passwordChangeConfirmModal.password) {
      setError("Debes ingresar tu contraseña actual para guardar los cambios.");
      setLoading(false);
      return;
    }
    // Aquí deberías hacer la petición real para actualizar la contraseña
    setPasswordChangeConfirmModal({ open: false, password: "", newPassword: "" });
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
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
    // Validar contraseña con Supabase
  const { error: loginError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: passwordModal.valor,
    });
    if (loginError) {
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

      {/* Card para cambiar contraseña */}
      <div className="config-user-card" key="password">
        <div className="label">Contraseña</div>
        <div className="value">********</div>
        <button className="update-btn" onClick={openPasswordChangeModal}>
          Cambiar contraseña
        </button>
      </div>
      {/* Modal para cambiar contraseña */}
      {passwordChangeModal.open && (
        <div className="config-modal-bg" onClick={closeModals}>
          <div className="config-modal" onClick={e => e.stopPropagation()}>
            <h3>Cambiar contraseña</h3>
            <form onSubmit={handlePasswordChangeSave}>
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={passwordChangeModal.newPassword}
                onChange={e => setPasswordChangeModal(m => ({ ...m, newPassword: e.target.value }))}
                required
              />
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={passwordChangeModal.confirmPassword}
                onChange={e => setPasswordChangeModal(m => ({ ...m, confirmPassword: e.target.value }))}
                required
              />
              {error && <div className="form-error">{error}</div>}
              <div className="modal-btns">
                <button className="modal-btn" type="submit">Continuar</button>
                <button className="modal-btn cancel" type="button" onClick={closeModals}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
            <h3>Actualizar {campos.find((c) => c.key === modal.campo)?.label}</h3>
            <form onSubmit={handleEditSave}>
              <input
                autoFocus
                value={modal.valor}
                onChange={(e) =>
                  setModal((m) => ({ ...m, valor: e.target.value }))
                }
                required
              />
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