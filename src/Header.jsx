import React from "react";
import "./Header.css";
import { useState } from "react";
import useTiendaUsuario from "./hooks/useTiendaUsuario";
import { useNavigate } from "react-router-dom";
import { FaCog, FaSignOutAlt, FaTimes } from "react-icons/fa";
// import useEntregasPendientesSupabase from "./useEntregasPendientesSupabase";

const Header = ({ onMenuClick, actions, user }) => {
  const userId = user?.id;
  const { tienda: tiendaUsuario, loading: loadingTienda } = useTiendaUsuario(userId);
  const [showUser, setShowUser] = useState(false);
  const navigate = useNavigate();
  const goToConfig = () => {
    navigate('/configuraciones');
    setShowUser(false);
  };
  return (
    <header className="header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <button className="menu-btn modern" aria-label="Menú" onClick={onMenuClick}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ffffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:scale-110 transition-transform duration-200">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
      <span className="header-title">
        CRM{user && user.nombre ? ` - ${user.nombre}` : ""}
      </span>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        {/* Botón usuario */}
        <button
          aria-label="Usuario"
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg,#1a73e8,#4dabf7)',
            border: 'none',
            borderRadius: '50%',
            width: 38,
            height: 38,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setShowUser((v) => !v)}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-2.5 3-4 6-4s6 1.5 6 4"/></svg>
        </button>
        {actions && <div className="header-actions">{actions}</div>}
      </div>
      {/* Modal de usuario */}
      {showUser && user && (
        <div style={{position: 'absolute', top: 56, right: 24, background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.18)', borderRadius: 16, minWidth: 320, zIndex: 999, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#1a73e8,#4dabf7)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12}}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20c0-2.5 3-4 6-4s6 1.5 6 4"/></svg>
          </div>
          <div style={{fontWeight: 700, fontSize: 20, color: '#1a73e8', marginBottom: 4}}>{user.nombre || 'Usuario'}</div>
          <div style={{fontSize: 15, color: '#444', marginBottom: 8}}>{user.email || user.correo || ''}</div>
          <div style={{fontSize: 14, color: '#666', marginBottom: 8}}>
            Tienda: {loadingTienda ? 'Cargando...' : (tiendaUsuario || 'No registrada')}
          </div>
          {user.telefono && <div style={{fontSize: 14, color: '#666', marginBottom: 8}}>Teléfono: {user.telefono}</div>}
          {user.rol && <div style={{fontSize: 13, color: '#4dabf7', marginBottom: 8, fontWeight: 600}}>Rol: {user.rol}</div>}
          <div style={{display: 'flex', gap: 20, marginTop: 12}}>
            <button title="Configuraciones" style={{background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}} onClick={goToConfig}>
              <FaCog size={28} />
            </button>
            <button title="Cerrar sesión" style={{background: '#e63946', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}} onClick={async () => {
              if (window.supabase) {
                await window.supabase.auth.signOut();
              }
              localStorage.removeItem("token");
              localStorage.removeItem("userId");
              localStorage.removeItem("nombre");
              setShowUser(false);
              window.location.reload();
            }}>
              <FaSignOutAlt size={28} />
            </button>
            <button title="Cerrar modal" style={{background: '#888', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}} onClick={() => setShowUser(false)}>
              <FaTimes size={28} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
