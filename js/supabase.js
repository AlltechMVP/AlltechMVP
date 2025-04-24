
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://bpxvixyogbvvhykfeyqj.supabase.co"
const supabaseAnonKey = "YOUR_ANON_KEY_HERE" // Replace with your actual anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
