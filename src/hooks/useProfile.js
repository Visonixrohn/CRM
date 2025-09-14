import { useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Leer perfil por id
  const fetchProfile = useCallback(async (id) => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("profiles")
      .select("nombre,email,telefono")
      .eq("id", id)
      .maybeSingle();
    if (error) setError("Error al leer perfil");
    setProfile(data);
    setLoading(false);
    return data;
  }, []);

  // Actualizar perfil por id
  const updateProfile = useCallback(async (id, updates) => {
    setLoading(true);
    setError("");
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id);
    if (error) setError("Error al actualizar perfil");
    else setProfile((p) => ({ ...p, ...updates }));
    setLoading(false);
    return !error;
  }, []);

  return { profile, setProfile, loading, error, fetchProfile, updateProfile };
}
