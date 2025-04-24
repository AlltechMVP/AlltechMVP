
import { createClient } from '@supabase/supabase-js'

if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase URL or Anon Key')
}

const supabase = createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
)

window.supabaseClient = supabase

export default supabase
