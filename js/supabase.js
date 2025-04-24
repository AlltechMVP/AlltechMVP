
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://bpxvixyogbvvhykfeyqj.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJweHZpeHlvZ2J2dmh5a2ZleXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0MzY1NTIsImV4cCI6MjA2MTAxMjU1Mn0.1Uv1O6dJu3TCyVpk9CxhHM6Xdh8Yl7IFxA2Y9vOvlpY"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
