import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  FaCog,
  FaSearch,
  FaUserShield
} from "react-icons/fa";
import "./Sidebar.css";
import { supabase } from "./supabaseClient";

const Sidebar = ({
  open,
  setUser,
  closeSidebar
}) => {
  // Obtener usuario actual de localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}
  const location = useLocation();
  // Detectar si es móvil
  const isMobile = typeof window !== "undefined" ? window.innerWidth <= 768 : false;
  // Handler para cerrar sidebar en desktop
  const handleNavClick = () => {
    if (!isMobile && closeSidebar) closeSidebar();
  };
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
        <Link
          to="/"
          className="sidebar-icon"
          title="Comisiones"
          style={{ position: "relative" }}
          onClick={handleNavClick}
        >
          <FaDollarSign className="icon-text" />
          <span className="sidebar-tooltip">Comisiones</span>
        </Link>
        <Link
          to="/entregas"
          className="sidebar-icon"
          title="Entregas"
          style={{ position: "relative" }}
          onClick={handleNavClick}
        >
          <FaTruck className="icon-text" />
          <span className="sidebar-tooltip">Entregas</span>
        </Link>
        <Link
          to="/ordenes"
          className="sidebar-icon"
          title="Órdenes de Servicio"
          style={{ position: "relative" }}
          onClick={handleNavClick}
        >
          <FaBook className="icon-text" />
          <span className="sidebar-tooltip">Órdenes de Servicio</span>
        </Link>
        <Link
          to="/calculadoras"
          className="sidebar-icon"
          title="Calculadora"
          style={{ position: "relative" }}
          onClick={handleNavClick}
        >
          <FaCalculator className="icon-text" />
          <span className="sidebar-tooltip">Calculadora</span>
        </Link>
        <Link
          to="/razones"
          className="sidebar-icon"
          title="Razones"
          style={{ position: "relative" }}
          onClick={handleNavClick}
        >
          <FaClipboardList className="icon-text" />
          <span className="sidebar-tooltip">Razones</span>
        </Link>
        <Link
          to="/tiendas"
          className="sidebar-icon"
          title="Tiendas"
          style={{ position: "relative" }}
          onClick={handleNavClick}
        >
          <FaStore className="icon-text" />
          <span className="sidebar-tooltip">Tiendas</span>
        </Link>
        <Link
          to="/documentos"
          className="sidebar-icon"
          title="Documentos"
          style={{ position: "relative" }}
          onClick={handleNavClick}
        >
          <FaFileAlt className="icon-text" />
          <span className="sidebar-tooltip">Documentos</span>
        </Link>
        <Link
          to="/gestion"
          className="sidebar-icon"
          title="Gestión"
          style={{ position: "relative" }}
          onClick={handleNavClick}
        >
          <FaPhone className="icon-text" style={{ color: '#2196f3' }} />
          <span className="sidebar-tooltip">Gestión</span>
        </Link>
         <Link
          to="/seguimiento"
          className="sidebar-icon"
          title="Seguimiento"
          style={{ position: "relative" }}
          onClick={handleNavClick}
        >
          <FaSearch className="icon-text" style={{ color: '#2196f3' }} />
          <span className="sidebar-tooltip">Seguimiento</span>
        </Link>
        <Link
          to="/cotizaciones"
          className="sidebar-icon"
          title="Cotizaciones"
          style={{ position: "relative" }}
          onClick={handleNavClick}
        >
          <FaCreditCard className="icon-text" style={{ color: '#4caf50' }} />
          <span className="sidebar-tooltip">Cotizaciones</span>
        </Link>
        <Link
          to="/clientes-nuevos"
          className="sidebar-icon"
          title="Clientes Nuevos"
          style={{ position: "relative" }}
          onClick={handleNavClick}
        >
          <FaUserPlus className="icon-text" />
          <span className="sidebar-tooltip">Clientes Nuevos</span>
        </Link>
        <Link
          to="/actualizaciones"
          className="sidebar-icon"
          title="Actualizaciones"
          style={{ position: "relative" }}
          onClick={handleNavClick}
        >
          <FaUsers className="icon-text" />
          <span className="sidebar-tooltip">Actualizaciones</span>
        </Link>
       
        {/* Icono de Admin solo para superadmin */}
        {user && user.rol === "superadmin" && (
          <Link
            to="/admin"
            className="sidebar-icon"
            title="Admin"
            style={{ position: "relative" }}
            onClick={handleNavClick}
          >
            <FaUserShield className="icon-text" style={{ color: '#8e24aa' }} />
            <span className="sidebar-tooltip">Admin</span>
          </Link>
        )}
        {/* Icono de Configuración */}
        <Link
          to="/configuraciones"
          className="sidebar-icon"
          title="Configuraciones"
          style={{ position: "relative" }}
          onClick={handleNavClick}
        >
          <FaCog className="icon-text" style={{ color: '#757575' }} />
          <span className="sidebar-tooltip">Configuraciones</span>
        </Link>
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
