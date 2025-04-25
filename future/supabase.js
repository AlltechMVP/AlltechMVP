
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bpxvixyogbvvhykfeyqj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJweHZpeHlvZ2J2dmh5a2ZleXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MzY1NTIsImV4cCI6MjA2MTAxMjU1Mn0.ogMhQJcWe5qFF3ULOcHR3GO7quVGaE4RhaRA_AnRWDA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
