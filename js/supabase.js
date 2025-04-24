
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

window.supabaseClient = supabase
export { supabase }
