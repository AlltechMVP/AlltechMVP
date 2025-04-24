
import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://bpxvixyogbvvhykfeyqj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJweHZpeHlvZ2J2dmh5a2ZleXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MzY1NTIsImV4cCI6MjA2MTAxMjU1Mn0.ogMhQJcWe5qFF3ULOcHR3GO7quVGaE4RhaRA_AnRWDA'

// Initialize the Supabase client with URL and anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Initialize service client for admin operations
export const serviceClient = createClient(
    supabaseUrl,
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJweHZpeHlvZ2J2dmh5a2ZleXFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQzNjU1MiwiZXhwIjoyMDYxMDEyNTUyfQ.tVEGsIEHBEsAFomIQCcmGkc6JmUmHFSt_Rb1Qj7b5Lw'
)

// Export the initialized client
export default supabase
