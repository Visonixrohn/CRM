import React, { useState } from "react";
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
  FaSyncAlt,
  FaPhone,
  FaCreditCard,
  FaCog,
  FaSearch,
  FaUserShield,
  FaPercent
} from "react-icons/fa";
import "./BottomBar.css";


function getIconsWithAdmin() {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}
  const icons = [
    { key: "comisiones", label: "Comisiones", icon: <FaDollarSign color="#2196f3" /> },
    { key: "entregas", label: "Entregas", icon: <FaTruck color="#2196f3" /> },
    { key: "ordenes", label: "Órdenes", icon: <FaBook color="#2196f3" /> },
    { key: "calculadoras", label: "Calculadoras", icon: <FaCalculator color="#2196f3" /> },
    { key: "razones", label: "Razones", icon: <FaClipboardList color="#2196f3" /> },
    { key: "promedios", label: "Promedios", icon: <FaPercent color="#ff9800" /> },
    { key: "tiendas", label: "Tiendas", icon: <FaStore color="#2196f3" /> },
    { key: "documentos", label: "Documentos", icon: <FaFileAlt color="#2196f3" /> },
    { key: "clientes-nuevos", label: "Clientes Nuevos", icon: <FaUserPlus color="#2196f3" /> },
    { key: "cotizaciones", label: "Cotizaciones", icon: <FaCreditCard color="#2196f3" /> },
    { key: "actualizaciones", label: "Actualizaciones", icon: <FaUsers color="#2196f3" /> },
    { key: "gestion", label: "Gestión", icon: <FaPhone color="#2196f3" /> },
    { key: "seguimiento", label: "Seguimiento", icon: <FaSearch color="#2196f3" /> },
    { key: "configuraciones", label: "Configuraciones", icon: <FaCog color="#2196f3" /> },
    { key: "aprendisaje", label: "Aprendisaje", icon: <FaBook color="#009688" /> },
  ];
  if (user && (user.rol === "admin" || user.rol === "superadmin")) {
    icons.push({ key: "admin", label: "Admin", icon: <FaUserShield color="#8e24aa" /> });
  }
  return icons;
}

const BottomBar = ({
  onNavigate,
  active,
  expanded,
  onCloseExpand,
  onLogout,
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // Mostrar solo los primeros 5 iconos si no está expandido
  const ICONS = getIconsWithAdmin();
  const visibleIcons = expanded ? ICONS : ICONS.slice(0, 5);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    // Limpiar toda la información de sesión relevante
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("nombre");
    if (onLogout) onLogout();
    // Forzar recarga para limpiar cualquier estado residual
    window.location.reload();
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Modal de confirmación de logout */}
      {showLogoutModal && (
        <div className="bottom-bar-logout-modal-overlay" onClick={handleCancelLogout}>
          <div className="bottom-bar-logout-modal" onClick={e => e.stopPropagation()}>
            <p>¿Estás seguro que deseas cerrar sesión?</p>
            <div className="bottom-bar-logout-modal-buttons">
              <button onClick={handleConfirmLogout} className="confirm">Sí, cerrar sesión</button>
              <button onClick={handleCancelLogout} className="cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {/* Menú expandido tipo modal */}
      {expanded && (
        <div className="bottom-bar-expand-overlay" onClick={onCloseExpand}>
          <div
            className="bottom-bar-expand-menu"
            onClick={(e) => e.stopPropagation()}
          >
            {ICONS.map((icon) => (
              (icon.key !== "admin" || (icon.key === "admin" && (JSON.parse(localStorage.getItem("user"))?.rol === "admin" || JSON.parse(localStorage.getItem("user"))?.rol === "superadmin"))) && (
                <button
                  key={icon.key}
                  className={active === icon.key ? "active" : ""}
                  onClick={() => {
                    onNavigate(icon.key);
                    onCloseExpand();
                  }}
                >
                  <span className="bottom-bar-icon" aria-label={icon.label}>
                    {icon.icon}
                  </span>
                  <span className="bottom-bar-label">{icon.label}</span>
                </button>
              )
            ))}
            
           
            <button className="bottom-bar-reload" onClick={() => window.location.reload()}>
              <span className="bottom-bar-icon" aria-label="Recargar app">
                <FaSyncAlt color="#2196f3" />
              </span>
              <span className="bottom-bar-label">Recargar</span>
            </button>
            <button className="bottom-bar-close-expand" onClick={onCloseExpand}>
              Cerrar
            </button>
             <button className="bottom-bar-logout" onClick={handleLogoutClick}>
              <span className="bottom-bar-icon" aria-label="Cerrar sesión">
                <FaSignOutAlt color="#2196f3" />
              </span>
              <span className="bottom-bar-label">Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
      <nav className="bottom-bar">
        {visibleIcons.map((icon) => (
          <button
            key={icon.key}
            className={active === icon.key ? "active" : ""}
            onClick={() => onNavigate(icon.key)}
          >
            <span className="bottom-bar-icon" aria-label={icon.label}>
              {icon.icon}
            </span>
            <span className="bottom-bar-label">{icon.label}</span>
          </button>
        ))}
        <button className="bottom-bar-logout" onClick={handleLogoutClick}>
          <span className="bottom-bar-icon" aria-label="Cerrar sesión">
            <FaSignOutAlt color="#2196f3" />
          </span>
          <span className="bottom-bar-label">Cerrar sesión</span>
        </button>
        <button className="bottom-bar-reload" onClick={() => window.location.reload()}>
          <span className="bottom-bar-icon" aria-label="Recargar app">
            <FaSyncAlt color="#2196f3" />
          </span>
          <span className="bottom-bar-label">Recargar app</span>
        </button>
      </nav>
    </>
  );
};

export default BottomBar;
