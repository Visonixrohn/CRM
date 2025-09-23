import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ydowdpcladycccauvmob.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkb3dkcGNsYWR5Y2NjYXV2bW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2NTgxMTksImV4cCI6MjA3NDIzNDExOX0.W9FLueZVyuPXmEg7cx4qs4qWf8QspvdeO9Q9k97UALM";
const supabase = createClient(supabaseUrl, supabaseKey);

// id es el valor del campo 'id' único de Supabase
export async function eliminarSolicitudSupabase(id) {
  const { error } = await supabase
    .from("datos_personales")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return true;
}
