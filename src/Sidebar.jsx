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
  FaUserShield,
  FaPercent
} from "react-icons/fa";
import "./Sidebar.css";
import { supabase } from "./supabaseClient";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FaBars } from 'react-icons/fa';

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
    <aside className={`sidebar menu-bar${open ? " open" : ""}`}>
      <nav className="menu-items">
        <Link to="/entregas" className="menu-item" title="Entregas" onClick={handleNavClick}>
          <FaTruck className="icon-text" />
          <span className="menu-label">Entregas</span>
        </Link>
        <Link to="/ordenes" className="menu-item" title="Órdenes de Servicio" onClick={handleNavClick}>
          <FaBook className="icon-text" />
          <span className="menu-label">Órdenes</span>
        </Link>
        <Link to="/calculadoras" className="menu-item" title="Calculadora" onClick={handleNavClick}>
          <FaCalculator className="icon-text" />
          <span className="menu-label">Calculadora</span>
        </Link>
        <Link to="/razones" className="menu-item" title="Razones" onClick={handleNavClick}>
          <FaClipboardList className="icon-text" />
          <span className="menu-label">Razones</span>
        </Link>
        <Link to="/tiendas" className="menu-item" title="Tiendas" onClick={handleNavClick}>
          <FaStore className="icon-text" />
          <span className="menu-label">Tiendas</span>
        </Link>
        <Link to="/documentos" className="menu-item" title="Documentos" onClick={handleNavClick}>
          <FaFileAlt className="icon-text" />
          <span className="menu-label">Documentos</span>
        </Link>
        <Link to="/gestion" className="menu-item" title="Gestión" onClick={handleNavClick}>
          <FaPhone className="icon-text" style={{ color: '#2196f3' }} />
          <span className="menu-label">Gestión</span>
        </Link>
        <Link to="/seguimiento" className="menu-item" title="Seguimiento" onClick={handleNavClick}>
          <FaSearch className="icon-text" style={{ color: '#2196f3' }} />
          <span className="menu-label">Seguimiento</span>
        </Link>
        <Link to="/cotizaciones" className="menu-item" title="Cotizaciones" onClick={handleNavClick}>
          <FaCreditCard className="icon-text" style={{ color: '#4caf50' }} />
          <span className="menu-label">Cotizaciones</span>
        </Link>
        <Link to="/clientes-nuevos" className="menu-item" title="Clientes Nuevos" onClick={handleNavClick}>
          <FaUserPlus className="icon-text" />
          <span className="menu-label">Clientes</span>
        </Link>
        <Link to="/actualizaciones" className="menu-item" title="Actualizaciones" onClick={handleNavClick}>
          <FaUsers className="icon-text" />
          <span className="menu-label">Actualizaciones</span>
        </Link>
        <Link to="/promedios" className="menu-item" title="Promedios" onClick={handleNavClick}>
          <FaPercent className="icon-text" style={{ color: '#ff9800' }} />
          <span className="menu-label">Promedios</span>
        </Link>
        <Link to="/aprendisaje" className="menu-item" title="Cartera" onClick={handleNavClick}>
          <FaBook className="icon-text" style={{ color: '#009688' }} />
          <span className="menu-label">Cartera</span>
        </Link>
       
        {/* Icono de Admin solo para superadmin */}
        {user && user.rol === "superadmin" && (
          <Link to="/admin" className="menu-item" title="Admin" onClick={handleNavClick}>
            <FaUserShield className="icon-text" style={{ color: '#8e24aa' }} />
            <span className="menu-label">Admin</span>
          </Link>
        )}
      </nav>

      {/* Mobile dropdown using Radix */}
      <div className="menu-mobile">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="hamburger-btn" aria-label="Abrir menú">
            <FaBars />
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="dropdown-content">
            <DropdownMenu.Item asChild>
              <Link to="/entregas" onClick={handleNavClick}>Entregas</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/ordenes" onClick={handleNavClick}>Órdenes</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/calculadoras" onClick={handleNavClick}>Calculadora</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/tiendas" onClick={handleNavClick}>Tiendas</Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <Link to="/documentos" onClick={handleNavClick}>Documentos</Link>
            </DropdownMenu.Item>
            {user && user.rol === "superadmin" && (
              <DropdownMenu.Item asChild>
                <Link to="/admin" onClick={handleNavClick}>Admin</Link>
              </DropdownMenu.Item>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
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
