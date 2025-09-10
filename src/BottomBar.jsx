import React from "react";
import "./BottomBar.css";

const ICONS = [
  { key: "comisiones", label: "Comisiones", emoji: "💰" },
  { key: "entregas", label: "Entregas", emoji: "🚚" },
  { key: "ordenes", label: "Órdenes", emoji: "📝" },
  { key: "calculadoras", label: "Calculadoras", emoji: "🧮" },
  { key: "razones", label: "Razones", emoji: "📋" },
  { key: "tiendas", label: "Tiendas", emoji: "🏬" },
  { key: "documentos", label: "Documentos", emoji: "📄" },
  { key: "clientes-nuevos", label: "Clientes Nuevos", emoji: "🧑‍💼" },
  { key: "cotizaciones", label: "Cotizaciones", emoji: "💳" },
  { key: "actualizaciones", label: "Actualizaciones", emoji: "👥" },
  { key: "gestion", label: "Gestión", emoji: "📞" },
];

const BottomBar = ({
  onNavigate,
  active,
  expanded,
  onCloseExpand,
  onLogout,
}) => {
  // Mostrar solo los primeros 5 iconos si no está expandido
  const visibleIcons = expanded ? ICONS : ICONS.slice(0, 5);

  return (
    <>
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
                <span role="img" aria-label={icon.label}>
                  {icon.emoji}
                </span>
                <span className="bottom-bar-label">{icon.label}</span>
              </button>
            ))}
            <button className="bottom-bar-close-expand" onClick={onCloseExpand}>
              Cerrar
            </button>
            <button className="bottom-bar-logout" onClick={onLogout}>
              Cerrar sesión
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
            <span role="img" aria-label={icon.label}>
              {icon.emoji}
            </span>
            <span className="bottom-bar-label">{icon.label}</span>
          </button>
        ))}
        <button className="bottom-bar-logout" onClick={onLogout}>
          <span role="img" aria-label="Cerrar sesión">
            🚪
          </span>
          <span className="bottom-bar-label">Cerrar sesión</span>
        </button>
      </nav>
    </>
  );
};

export default BottomBar;
