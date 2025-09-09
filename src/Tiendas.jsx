import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./Razones.css";
import "./Tiendas.css";
import TiendasCard from "./components/TiendasCard";
import "./components/TiendasCard.css";

const Tiendas = () => {
  const [tiendas, setTiendas] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredTiendas, setFilteredTiendas] = useState([]);

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
    if (search.trim() === "") {
      setFilteredTiendas(tiendas); // Mostrar todos los datos si la búsqueda está en blanco
    } else {
      const searchTerms = search
        .toLowerCase()
        .split(/\s+/) // Dividir por espacios
        .map((term) => term.trim())
        .filter((term) => term !== ""); // Eliminar términos vacíos

      const newFilteredTiendas = tiendas.filter((tienda) =>
        searchTerms.some(
          (term) => tienda.numero_tienda.toLowerCase() === term // Comparar exactamente
        )
      );
      setFilteredTiendas(newFilteredTiendas);
    }
  }, [search, tiendas]); // Filtrar automáticamente cuando cambia la búsqueda o los datos

  return (
    <div className="razones-container">
      <h1>Tiendas</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por número de tienda (separados por espacios)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {/* Cards móviles */}
      {filteredTiendas.map((tienda) => (
        <TiendasCard key={tienda.id} tienda={{
          id: tienda.id,
          nombre: tienda.tienda,
          numero_tienda: tienda.numero_tienda,
          direccion: tienda.direccion || "",
          telefono: tienda.telefono || "",
          encargado: tienda.encargado || ""
        }} />
      ))}
      {/* Tabla solo visible en desktop por CSS */}
      <div className="tiendas-table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Número de Tienda</th>
              <th>Tienda</th>
            </tr>
          </thead>
          <tbody>
            {filteredTiendas.map((tienda) => (
              <tr key={tienda.id}>
                <td>{tienda.numero_tienda}</td>
                <td>{tienda.tienda}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tiendas;
