import React from "react";
import { Link } from "react-router-dom";
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
} from "react-icons/fa"; // Importing icons from react-icons
import "./Sidebar.css";
import { supabase } from "./supabaseClient";

const Sidebar = ({
  open,
  onComisionesClick,
  onEntregasClick,
  onOrdenesClick,
  onCalculadoraClick,
  onRazonesClick,
  onTiendasClick,
  onDocumentosClick,
  onClientesNuevosClick,
  onActualizacionesClick,
  setUser,
}) => {
  return (
    <aside className={`sidebar${open ? " open" : ""}`}>
      <nav className="sidebar-icons">
        <div
          className="sidebar-icon"
          title="Comisiones"
          onClick={onComisionesClick}
          style={{ position: "relative" }}
        >
          <FaDollarSign className="icon-text" />
          <span className="sidebar-tooltip">Comisiones</span>
        </div>
        <div
          className="sidebar-icon"
          title="Entregas"
          onClick={onEntregasClick}
          style={{ position: "relative" }}
        >
          <FaTruck className="icon-text" />
          <span className="sidebar-tooltip">Entregas</span>
        </div>
        <div
          className="sidebar-icon"
          title="Órdenes de Servicio"
          onClick={onOrdenesClick}
          style={{ position: "relative" }}
        >
          <FaBook className="icon-text" />
          <span className="sidebar-tooltip">Órdenes de Servicio</span>
        </div>
        <div
          className="sidebar-icon"
          title="Calculadora"
          onClick={onCalculadoraClick}
          style={{ position: "relative" }}
        >
          <FaCalculator className="icon-text" />
          <span className="sidebar-tooltip">Calculadora</span>
        </div>
        <div
          className="sidebar-icon"
          title="Razones"
          onClick={onRazonesClick}
          style={{ position: "relative" }}
        >
          <FaClipboardList className="icon-text" />
          <span className="sidebar-tooltip">Razones</span>
        </div>
        <div
          className="sidebar-icon"
          title="Tiendas"
          onClick={onTiendasClick}
          style={{ position: "relative" }}
        >
          <FaStore className="icon-text" />
          <span className="sidebar-tooltip">Tiendas</span>
        </div>
        <div
          className="sidebar-icon"
          title="Documentos"
          onClick={onDocumentosClick}
          style={{ position: "relative" }}
        >
          <FaFileAlt className="icon-text" />
          <span className="sidebar-tooltip">Documentos</span>
        </div>
        <div
          className="sidebar-icon"
          title="Clientes Nuevos"
          onClick={onClientesNuevosClick}
          style={{ position: "relative" }}
        >
          <FaUserPlus className="icon-text" />
          <span className="sidebar-tooltip">Clientes Nuevos</span>
        </div>
        <div
          className="sidebar-icon"
          title="Actualizaciones"
          onClick={onActualizacionesClick}
          style={{ position: "relative" }}
        >
          <FaUsers className="icon-text" />
          <span className="sidebar-tooltip">Actualizaciones</span>
        </div>
        <button
          className="sidebar-icon cerrar-sesion"
          title="Cerrar Sesión"
          onClick={async () => {
            const { error } = await supabase.auth.signOut();
            if (!error) {
              localStorage.removeItem("token");
              setUser(null);
            } else {
              console.error("Error al cerrar sesión:", error);
              alert("No se pudo cerrar la sesión. Inténtalo de nuevo.");
            }
          }}
        >
          <FaSignOutAlt className="icon-text" />
          <span className="sidebar-tooltip">Cerrar Sesión</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
