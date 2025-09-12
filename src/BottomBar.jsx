import React from "react";
import "./BottomBar.css";

const ICONS = [
  { key: "comisiones", label: "Comisiones", emoji: "💸" }, // Dinero en movimiento, más específico para comisiones
  { key: "entregas", label: "Entregas", emoji: "🚚" }, // Correcto, el camión representa entregas
  { key: "ordenes", label: "Órdenes", emoji: "🛒" }, // Carrito de compras, más relacionado con órdenes
  { key: "calculadoras", label: "Calculadoras", emoji: "🧮" }, // Correcto, la calculadora es adecuada
  { key: "razones", label: "Razones", emoji: "📊" }, // Gráfico para análisis o razones
  { key: "tiendas", label: "Tiendas", emoji: "🏪" }, // Tienda pequeña, más específica que un edificio
  { key: "documentos", label: "Documentos", emoji: "📑" }, // Documentos apilados, más preciso
  { key: "clientes-nuevos", label: "Clientes Nuevos", emoji: "🤝" }, // Apretón de manos, simboliza nuevos clientes
  { key: "cotizaciones", label: "Cotizaciones", emoji: "📈" }, // Gráfico ascendente, relacionado con finanzas/cotizaciones
  { key: "actualizaciones", label: "Actualizaciones", emoji: "🔄" }, // Símbolo de actualización o sincronización
  { key: "gestion", label: "Gestión", emoji: "📋" } // Portapapeles, más asociado con gestión,
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
