
const SUPABASE_URL = "https://bpxvixyogbvvhykfeyqj.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Supabase initialized:", supabase);
