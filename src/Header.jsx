import React from "react";
import "./Header.css";

const Header = ({ onMenuClick, actions, user }) => {
  return (
    <header className="header">
      <button className="menu-btn modern" aria-label="Menú" onClick={onMenuClick}>
       <svg
  xmlns="http://www.w3.org/2000/svg"
  width="32"
  height="32"
  viewBox="0 0 24 24"
  fill="none"
  stroke="#ffffffff"
  strokeWidth="2.5"
  strokeLinecap="round"
  strokeLinejoin="round"
  className="cursor-pointer hover:scale-110 transition-transform duration-200"
>
  <line x1="4" y1="6" x2="20" y2="6" />
  <line x1="4" y1="12" x2="20" y2="12" />
  <line x1="4" y1="18" x2="20" y2="18" />
</svg>

      </button>
      <span className="header-title">
        CRM{user && user.nombre ? ` - ${user.nombre}` : ""}
      </span>
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
};

export default Header;
