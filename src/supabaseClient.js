import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://caqukltkvvsfairqphjf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhcXVrbHRrdnZzZmFpcnFwaGpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNDE5MTAsImV4cCI6MjA3MjcxNzkxMH0.YIxH_Eb9Uq77wizIdD2-gMrhNdNbSwYRWMXcNdfsPMg";
export const supabase = createClient(supabaseUrl, supabaseKey);
