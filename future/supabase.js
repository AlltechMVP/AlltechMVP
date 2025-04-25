
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client 
export const supabase = createClient(
  'YOUR_SUPABASE_URL', // Replace with actual URL from Secrets
  'YOUR_SUPABASE_KEY'  // Replace with actual key from Secrets
);
