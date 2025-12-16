import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./Razones.css";
import "./TiendasNew.css";
import TiendasCard from "./components/TiendasCard";
import "./components/TiendasCard.css";
import EditarTiendaModal from "./components/EditarTiendaModal";

const Tiendas = () => {
  const [tiendas, setTiendas] = useState([]);
  const [search, setSearch] = useState("");
  const [searchNombre, setSearchNombre] = useState("");
  const [filteredTiendas, setFilteredTiendas] = useState([]);
  const [tiendaEditando, setTiendaEditando] = useState(null);

  useEffect(() => {
    const fetchTiendas = async () => {
      const { data, error } = await supabase.from("tiendas").select("*"); // Obtener todas las tiendas sin filtrar por usuario

      if (error) {
        console.error("Error fetching tiendas:", error);
      } else {
        setTiendas(data);
        setFilteredTiendas(data);
      }
    };

    fetchTiendas();
  }, []);

  useEffect(() => {
    let result = tiendas;
    // Filtrar por número de tienda si hay búsqueda
    if (search.trim() !== "") {
      const searchTerms = search
        .toLowerCase()
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term !== "");
      result = result.filter((tienda) =>
        searchTerms.some(
          (term) => tienda.numero_tienda.toLowerCase() === term
        )
      );
    }
    // Filtrar por nombre de tienda si hay búsqueda
    if (searchNombre.trim() !== "") {
      const nombreTerm = searchNombre.toLowerCase();
      result = result.filter((tienda) =>
        tienda.tienda && tienda.tienda.toLowerCase().includes(nombreTerm)
      );
    }
    setFilteredTiendas(result);
  }, [search, searchNombre, tiendas]);

  // Conteos para la barra lateral
  const conteoTipos = {
    Todos: tiendas.length,
    "Con teléfono": tiendas.filter((t) => t.telefono && t.telefono.trim() !== "").length,
    "Sin teléfono": tiendas.filter((t) => !t.telefono || t.telefono.trim() === "").length,
    "Con encargado": tiendas.filter((t) => t.encargado && t.encargado.trim() !== "").length,
    "Sin dirección": tiendas.filter((t) => !t.direccion || t.direccion.trim() === "").length,
  };

  const [filtroSidebar, setFiltroSidebar] = useState("Todos");

  // Filtrado combinado (search + sidebar)
  useEffect(() => {
    let result = tiendas;
    // aplicar búsqueda por número
    if (search.trim() !== "") {
      const searchTerms = search
        .toLowerCase()
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term !== "");
      result = result.filter((tienda) =>
        searchTerms.some((term) => tienda.numero_tienda.toLowerCase() === term)
      );
    }
    // aplicar búsqueda por nombre
    if (searchNombre.trim() !== "") {
      const nombreTerm = searchNombre.toLowerCase();
      result = result.filter((tienda) =>
        tienda.tienda && tienda.tienda.toLowerCase().includes(nombreTerm)
      );
    }
    // aplicar filtro lateral
    if (filtroSidebar === "Con teléfono") {
      result = result.filter((t) => t.telefono && t.telefono.trim() !== "");
    } else if (filtroSidebar === "Sin teléfono") {
      result = result.filter((t) => !t.telefono || t.telefono.trim() === "");
    } else if (filtroSidebar === "Con encargado") {
      result = result.filter((t) => t.encargado && t.encargado.trim() !== "");
    } else if (filtroSidebar === "Sin dirección") {
      result = result.filter((t) => !t.direccion || t.direccion.trim() === "");
    }

    setFilteredTiendas(result);
  }, [search, searchNombre, tiendas, filtroSidebar]);

  const handleEditar = (tienda) => {
    setTiendaEditando(tienda);
  };

  const handleGuardarEdicion = async (tiendaId, datosActualizados) => {
    try {
      const { error } = await supabase
        .from("tiendas")
        .update(datosActualizados)
        .eq("id", tiendaId);

      if (error) {
        console.error("Error al actualizar tienda:", error);
        alert("Error al actualizar la tienda");
        return;
      }

      // Actualizar el estado local
      setTiendas((prev) =>
        prev.map((t) => (t.id === tiendaId ? { ...t, ...datosActualizados } : t))
      );
      setTiendaEditando(null);
      alert("Tienda actualizada exitosamente");
    } catch (err) {
      console.error("Error:", err);
      alert("Error al guardar los cambios");
    }
  };

  return (
    <div className="tiendas-layout">
      <aside className="tiendas-sidebar">
        <div className="sidebar-header">Filtros</div>
        <ul className="sidebar-list">
          {Object.keys(conteoTipos).map((key) => (
            <li
              key={key}
              className={`sidebar-item ${filtroSidebar === key ? "active" : ""}`}
              onClick={() => setFiltroSidebar(key)}
            >
              <span className="item-label">{key}</span>
              <span className="item-count">{conteoTipos[key]}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="tiendas-main">
        <div className="tiendas-header">
          <h1>Tiendas</h1>
          <div className="tiendas-actions">
            <div className="search-group">
              <input
                className="input-search"
                type="text"
                placeholder="Buscar Nº tienda (espacios para múltiples)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <input
                className="input-search nombre"
                type="text"
                placeholder="Buscar por nombre"
                value={searchNombre}
                onChange={(e) => setSearchNombre(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="tiendas-summary">
          <div className="summary-card">
            <div className="summary-title">Total</div>
            <div className="summary-value">{conteoTipos.Todos}</div>
          </div>
          <div className="summary-card">
            <div className="summary-title">Con teléfono</div>
            <div className="summary-value">{conteoTipos["Con teléfono"]}</div>
          </div>
          <div className="summary-card">
            <div className="summary-title">Con encargado</div>
            <div className="summary-value">{conteoTipos["Con encargado"]}</div>
          </div>
        </div>

        <section className="tabla-entregas-scroll">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Nº Tienda</th>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Encargado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTiendas.map((tienda) => (
                <tr key={tienda.id}>
                  <td data-label="Nº">{tienda.numero_tienda}</td>
                  <td data-label="Nombre">{tienda.tienda}</td>
                  <td data-label="Dirección">{tienda.direccion || "-"}</td>
                  <td data-label="Teléfono">{tienda.telefono || "-"}</td>
                  <td data-label="Encargado">{tienda.encargado || "-"}</td>
                  <td data-label="Acciones">
                    <button className="btn btn-outline">Ver</button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEditar(tienda)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Mobile cards */}
        <div className="tiendas-cards-mobile">
          {filteredTiendas.map((tienda) => (
            <TiendasCard
              key={tienda.id}
              tienda={{
                id: tienda.id,
                nombre: tienda.tienda,
                numero_tienda: tienda.numero_tienda,
                direccion: tienda.direccion || "",
                telefono: tienda.telefono || "",
                encargado: tienda.encargado || "",
              }}
              onEditar={() => handleEditar(tienda)}
            />
          ))}
        </div>
      </main>

      {tiendaEditando && (
        <EditarTiendaModal
          tienda={tiendaEditando}
          onClose={() => setTiendaEditando(null)}
          onSave={handleGuardarEdicion}
        />
      )}
    </div>
  );
};

export default Tiendas;
