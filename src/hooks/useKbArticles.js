import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useKbArticles({ role = null, limit = 200 } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      let q = supabase.from('kb_articles').select('id,slug,title,body,tags,roles,updated_at').order('updated_at', { ascending: false }).limit(limit);
      const { data, error } = await q;
      if (!mounted) return;
      if (error) setError(error);
      else setData(data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [limit]);

  const visible = useMemo(() => {
    if (!role) return data;
    return (data || []).filter(a => Array.isArray(a.roles) ? a.roles.includes(role) : true);
  }, [data, role]);

  return { data: visible, loading, error };
}
