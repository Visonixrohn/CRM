import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaDollarSign,
  FaTruck,
  FaBook,
  FaCalculator,
  FaClipboardList,
  FaStore,
  FaFileAlt,
  FaUserPlus,
  FaUsers,
  FaSignOutAlt,
  FaPhone,
  FaCreditCard,
} from "react-icons/fa"; // Importing icons from react-icons
import "./Sidebar.css";
import { supabase } from "./supabaseClient";

const Sidebar = ({
  open,
  onComisionesClick,
  onEntregasClick,
  onOrdenesClick,
  onCalculadoraClick,
  onRazonesClick,
  onTiendasClick,
  onDocumentosClick,
  onClientesNuevosClick,
  onCotizacionesClick,
  onActualizacionesClick,
  setUser,
  onGestionClick,
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    const { error } = await supabase.auth.signOut();
    // Limpiar toda la información de sesión relevante
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("nombre");
    setUser(null);
    setLogoutLoading(false);
    setShowLogoutModal(false);
    // Forzar recarga para limpiar cualquier estado residual
    window.location.reload();
  };

  return (
    <aside className={`sidebar${open ? " open" : ""}`}>
      <nav className="sidebar-icons">
        <div
          className="sidebar-icon"
          title="Comisiones"
          onClick={onComisionesClick}
          style={{ position: "relative" }}
        >
          <FaDollarSign className="icon-text" />
          <span className="sidebar-tooltip">Comisiones</span>
        </div>
        <div
          className="sidebar-icon"
          title="Entregas"
          onClick={onEntregasClick}
          style={{ position: "relative" }}
        >
          <FaTruck className="icon-text" />
          <span className="sidebar-tooltip">Entregas</span>
        </div>
        <div
          className="sidebar-icon"
          title="Órdenes de Servicio"
          onClick={onOrdenesClick}
          style={{ position: "relative" }}
        >
          <FaBook className="icon-text" />
          <span className="sidebar-tooltip">Órdenes de Servicio</span>
        </div>
        <div
          className="sidebar-icon"
          title="Calculadora"
          onClick={onCalculadoraClick}
          style={{ position: "relative" }}
        >
          <FaCalculator className="icon-text" />
          <span className="sidebar-tooltip">Calculadora</span>
        </div>
        <div
          className="sidebar-icon"
          title="Razones"
          onClick={onRazonesClick}
          style={{ position: "relative" }}
        >
          <FaClipboardList className="icon-text" />
          <span className="sidebar-tooltip">Razones</span>
        </div>
        <div
          className="sidebar-icon"
          title="Tiendas"
          onClick={onTiendasClick}
          style={{ position: "relative" }}
        >
          <FaStore className="icon-text" />
          <span className="sidebar-tooltip">Tiendas</span>
        </div>
        <div
          className="sidebar-icon"
          title="Documentos"
          onClick={onDocumentosClick}
          style={{ position: "relative" }}
        >
          <FaFileAlt className="icon-text" />
          <span className="sidebar-tooltip">Documentos</span>
        </div>
        <div
          className="sidebar-icon"
          title="Gestión"
          onClick={onGestionClick}
          style={{ position: "relative" }}
        >
          <FaPhone className="icon-text" style={{ color: '#2196f3' }} />
          <span className="sidebar-tooltip">Gestión</span>
        </div>
        <div
          className="sidebar-icon"
          title="Cotizaciones"
          onClick={onCotizacionesClick}
          style={{ position: "relative" }}
        >
          <FaCreditCard className="icon-text" style={{ color: '#4caf50' }} />
          <span className="sidebar-tooltip">Cotizaciones</span>
        </div>
        <div
          className="sidebar-icon"
          title="Clientes Nuevos"
          onClick={onClientesNuevosClick}
          style={{ position: "relative" }}
        >
          <FaUserPlus className="icon-text" />
          <span className="sidebar-tooltip">Clientes Nuevos</span>
        </div>
        <div
          className="sidebar-icon"
          title="Actualizaciones"
          onClick={onActualizacionesClick}
          style={{ position: "relative" }}
        >
          <FaUsers className="icon-text" />
          <span className="sidebar-tooltip">Actualizaciones</span>
        </div>
        <button
          className="sidebar-icon cerrar-sesion"
          title="Cerrar Sesión"
          onClick={() => setShowLogoutModal(true)}
        >
          <FaSignOutAlt className="icon-text" />
          <span className="sidebar-tooltip">Cerrar Sesión</span>
        </button>
      </nav>
      {showLogoutModal && (
        <div
          className="modal-logout-overlay"
          onClick={e => {
            if (e.target === e.currentTarget) setShowLogoutModal(false);
          }}
        >
          <div className="modal-logout">
            <h3>¿Seguro que deseas cerrar sesión?</h3>
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <button className="modal-btn confirm" onClick={handleLogout} disabled={logoutLoading}>
                {logoutLoading ? 'Cerrando...' : 'Sí, cerrar sesión'}
              </button>
              <button className="modal-btn cancel" onClick={() => setShowLogoutModal(false)} disabled={logoutLoading}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
