import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Fetches dashboard KPIs from view v_kpis (created in Batch 06).
 * Returns an object: { active_assignments, open_jobs, total_candidates, hours_pending }
 */
export function useKpis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase.from('v_kpis').select('*').single();
      if (!mounted) return;
      if (error) setError(error);
      else setData(data || null);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return { data, loading, error };
}
