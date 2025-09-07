import React from "react";
import "./Header.css";

const Header = ({ onMenuClick, actions }) => {
  return (
    <header className="header">
      <button className="menu-btn" aria-label="Menú" onClick={onMenuClick}>
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <span className="header-title">CRM MIGUEL</span>
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
};

export default Header;
