
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bpxvixyogbvvhykfeyqj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJweHZpeHlvZ2J2dmh5a2ZleXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU0NzUyNzUsImV4cCI6MjAyMTA1MTI3NX0.qC3-tKgRB6R8PjfKrOK-6B-QLZW5hn6LaGzKN_LmCnE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
