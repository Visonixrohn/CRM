import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./Razones.css";
import RazonesCard from "./components/RazonesCard";
import "./components/RazonesCard.css";

const Razones = () => {
  const [razones, setRazones] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredRazones, setFilteredRazones] = useState([]);

  useEffect(() => {
    const fetchRazones = async () => {
      const { data, error } = await supabase.from("razones").select("*");
      if (error) {
        console.error("Error fetching razones:", error);
      } else {
        setRazones(data);
        setFilteredRazones(data);
      }
    };

    fetchRazones();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredRazones(razones); // Mostrar todos los datos si la búsqueda está en blanco
    } else {
      const searchTerms = search
        .toLowerCase()
        .split(/\s+/) // Dividir por espacios
        .map((term) => term.trim())
        .filter((term) => term !== ""); // Eliminar términos vacíos

      const newFilteredRazones = razones.filter(
        (razon) =>
          searchTerms.some((term) => razon.codigo.toLowerCase() === term) // Comparar exactamente
      );
      setFilteredRazones(newFilteredRazones);
    }
  }, [search, razones]); // Filtrar automáticamente cuando cambia la búsqueda o los datos

  return (
    <div className="razones-container">
      <h1>Razones</h1>
      <input
        type="text"
        placeholder="Buscar razón..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />
      {/* Cards móviles */}
      {filteredRazones.map((razon) => (
        <RazonesCard key={razon.id} razon={razon} />
      ))}
      {/* Tabla solo visible en desktop por CSS */}
      <div className="razones-table-container">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {filteredRazones.map((razon) => (
              <tr key={razon.id}>
                <td>{razon.codigo}</td>
                <td>{razon.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Razones;
