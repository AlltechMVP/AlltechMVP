
const SUPABASE_URL = "https://bpxvixyogbvvhykfeyqj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJweHZpeHlvZ2J2dmh5a2ZleXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MzY1NTIsImV4cCI6MjA2MTAxMjU1Mn0.ogMhQJcWe5qFF3ULOcHR3GO7quVGaE4RhaRA_AnRWDA";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

console.log("Supabase initialized:", supabase);
