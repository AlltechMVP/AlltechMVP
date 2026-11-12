import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useJobs(limit = 100) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id,title,location,rate,openings,status,client_id,clients(name)')
        .limit(limit);
      if (!mounted) return;
      if (error) setError(error);
      else setData(data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [limit]);

  return { data, loading, error };
}
