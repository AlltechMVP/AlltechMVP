
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

// Single instance of Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Single instance of service client
export const serviceClient = createClient(
    supabaseUrl,
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJweHZpeHlvZ2J2dmh5a2ZleXFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQzNjU1MiwiZXhwIjoyMDYxMDEyNTUyfQ.tVEGsIEHBEsAFomIQCcmGkc6JmUmHFSt_Rb1Qj7b5Lw'
)
