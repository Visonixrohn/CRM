import { useState, useEffect } from "react";

/**
 * Hook para obtener el nombre del usuario logueado de localStorage o Supabase.
 * Si no existe, retorna string vacío.
 * @returns {string} nombreUsuario
 */
export default function useNombreUsuario() {
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    let nombreLocal = localStorage.getItem("nombre");
    if (nombreLocal) {
      setNombre(nombreLocal);
    } else {
      // Si se requiere, aquí se puede agregar lógica para buscar en Supabase
      setNombre("");
    }
  }, []);

  return nombre;
}
