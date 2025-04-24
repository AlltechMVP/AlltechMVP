
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY
)

window.supabaseClient = supabase
export { supabase }
