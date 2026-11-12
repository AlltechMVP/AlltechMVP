
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  // Visible in dev; silent in prod to avoid leaking env hints to users
  if (import.meta.env.MODE !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[Supabase] Missing env: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  }
}

export const supabase = createClient(url ?? '', anon ?? '');
