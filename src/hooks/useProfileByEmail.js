import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function useProfileByEmail(email) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchProfile() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, identidad, telefono, email")
      .eq("email", email.trim())
      .maybeSingle();
    if (error) setError(error.message);
    setProfile(data);
    setLoading(false);
    return data;
  }

  return { profile, loading, error, fetchProfile };
}
