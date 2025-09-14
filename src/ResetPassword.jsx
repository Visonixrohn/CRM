

import React, { useState } from "react";
import { supabase } from "./supabaseClient";
import { hashPassword } from "./utils/hash";
import styles from "./ResetPassword.module.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Permitir reset por uid (flujo personalizado)
  const params = new URLSearchParams(window.location.search);
  const uid = params.get("uid");


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!password || password.length < 6) return setMsg("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) return setMsg("Las contraseñas no coinciden.");
    setLoading(true);
    if (!uid) {
      setMsg("No se pudo validar el usuario para resetear la contraseña.");
      setLoading(false);
      return;
    }
    // Actualizar la contraseña en profiles
    const hash = await hashPassword(password);
    const { error } = await supabase
      .from('profiles')
      .update({ contrasena: hash })
      .eq('id', uid);
    if (error) setMsg("Error al actualizar la contraseña: " + error.message);
    else {
      setMsg("¡Contraseña actualizada! Redirigiendo al login...");
      setTimeout(() => {
        localStorage.removeItem("userId");
        localStorage.removeItem("nombre");
        window.location.href = "/";
      }, 1800);
    }
    setLoading(false);
  };

  if (!uid) {
    return (
      <div className={styles["resetpw-bg"]}>
        <div className={styles["resetpw-card"]}>
          <h2 className={styles["resetpw-title"]} style={{ color: "#d32f2f" }}>No se pudo validar el usuario</h2>
          <p style={{ color: "#555", fontSize: 16 }}>
            El enlace de recuperación es inválido o falta el identificador de usuario.<br />
            Por seguridad, solicita un nuevo enlace desde la página de inicio de sesión.
          </p>
          <a href="/" className={styles["resetpw-link"]}>Ir al inicio de sesión</a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["resetpw-bg"]}>
      <div className={styles["resetpw-card"]}>
        <h2 className={styles["resetpw-title"]}>Restablecer contraseña</h2>
        <form className={styles["resetpw-form"]} onSubmit={handleSubmit}>
          <input
            className={styles["resetpw-input"]}
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          <input
            className={styles["resetpw-input"]}
            type="password"
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
          {msg && <div className={msg.startsWith('¡') ? `${styles["resetpw-msg"]} ${styles["success"]}` : styles["resetpw-msg"]}>{msg}</div>}
          <button className={styles["resetpw-btn"]} type="submit" disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
