
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

// A stalled request must fail fast instead of hanging the page:
// supabase-js ships no fetch timeout, so one stalled PostgREST call used
// to hold the whole reconcile until fetchSettledOrLocal's race timeout.
// 8s is far above the measured ~100ms request latency and below the 10s
// settled-load timeout, so a stall is retried (withRetry) or falls back
// to local data instead of hanging. The caller's own signal, when one is
// passed, wins over this timer.
function fetchWithTimeout(input, init) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  const signal = init?.signal ?? controller.signal;
  return fetch(input, { ...init, signal }).finally(() => clearTimeout(timer));
}

export const supabase = createClient(url ?? '', anon ?? '', {
  global: { fetch: fetchWithTimeout },
});
