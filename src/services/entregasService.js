import { supabase } from "../supabaseClient";

export const fetchEntregas = async (userId) => {
  const { data, error } = await supabase
    .from("entregas_pendientes")
    .select("*")
    .eq("usuario_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching entregas:", error);
    return [];
  }
  return data;
};

export const updateEstatus = async (entregaId, nuevoEstatus) => {
  try {

    const { error } = await supabase
      .from("entregas_pendientes")
      .update({ estatus: nuevoEstatus })
      .eq("id", entregaId);

    if (error) {
      console.error("Error updating estatus:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Unexpected error updating estatus:", err);
    return false;
  }
};

export const addEntrega = async (entrega, userId) => {
  const { error } = await supabase
    .from("entregas_pendientes")
    .insert([{ ...entrega, usuario_id: userId }]);
  if (error) {
    console.error("Error adding entrega:", error);
    return false;
  }
  return true;
};
