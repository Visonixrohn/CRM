import React from "react";
import "./Header.css";

const Header = ({ onMenuClick, actions }) => {
  return (
    <header className="header">
      <button className="menu-btn" aria-label="Menú" onClick={onMenuClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path className="line top" d="M3 6h18" />
          <path className="line middle" d="M3 12h18" />
          <path className="line bottom" d="M3 18h18" />
        </svg>

      </button>
      <span className="header-title">CRM</span>
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
};

export default Header;
