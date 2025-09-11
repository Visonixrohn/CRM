import { supabase } from '../supabaseClient';

export async function listProfilesEmails() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, identidad, telefono');
  if (error) {
    console.error('Error al consultar profiles:', error.message);
    return [];
  }
  return data;
}
