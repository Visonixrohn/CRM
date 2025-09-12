import React, { useState, useEffect, useRef } from "react";
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
} from "react-icons/fa";
import "./BottomBar.css";

const ICONS = [
  { key: "comisiones", label: "Comisiones", icon: <FaDollarSign color="#2196f3" /> },
  { key: "entregas", label: "Entregas", icon: <FaTruck color="#2196f3" /> },
  { key: "ordenes", label: "Órdenes", icon: <FaBook color="#2196f3" /> },
  { key: "calculadoras", label: "Calculadoras", icon: <FaCalculator color="#2196f3" /> },
  { key: "razones", label: "Razones", icon: <FaClipboardList color="#2196f3" /> },
  { key: "tiendas", label: "Tiendas", icon: <FaStore color="#2196f3" /> },
  { key: "documentos", label: "Documentos", icon: <FaFileAlt color="#2196f3" /> },
  { key: "clientes-nuevos", label: "Clientes Nuevos", icon: <FaUserPlus color="#2196f3" /> },
  { key: "cotizaciones", label: "Cotizaciones", icon: <FaCreditCard color="#2196f3" /> },
  { key: "actualizaciones", label: "Actualizaciones", icon: <FaUsers color="#2196f3" /> },
  { key: "gestion", label: "Gestión", icon: <FaPhone color="#2196f3" /> },
];

const BottomBar = ({
  onNavigate,
  active,
  expanded,
  onCloseExpand,
  onLogout,
}) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // Manejo de historial para menú expandido y logout modal
  const firstRender = useRef(true);
  useEffect(() => {
    if (expanded || showLogoutModal) {
      if (!firstRender.current) {
        window.history.pushState({ modal: expanded ? 'bottomBarExpand' : 'bottomBarLogout' }, '');
      }
      const handlePop = (e) => {
        if (expanded) onCloseExpand && onCloseExpand();
        if (showLogoutModal) setShowLogoutModal(false);
      };
      window.addEventListener('popstate', handlePop);
      return () => {
        window.removeEventListener('popstate', handlePop);
        if (!firstRender.current && (expanded || showLogoutModal)) {
          window.history.back();
        }
      };
    }
    firstRender.current = false;
  }, [expanded, showLogoutModal]);
  // Mostrar solo los primeros 5 iconos si no está expandido
  const visibleIcons = expanded ? ICONS : ICONS.slice(0, 5);

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
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
            ))}
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
      </nav>
    </>
  );
};

export default BottomBar;
