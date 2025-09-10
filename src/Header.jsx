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
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path class="line top" d="M3 6h18" />
  <path class="line middle" d="M3 12h18" />
  <path class="line bottom" d="M3 18h18" />
</svg>

      </button>
      <span className="header-title">CRM</span>
      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
};

export default Header;
