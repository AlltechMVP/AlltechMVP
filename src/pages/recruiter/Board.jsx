import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Loader from '@/components/ui/Loader.jsx';
import Empty from '@/components/ui/Empty.jsx';
import { useWithToast } from '@/utils/withToast.js';

export default function RecruiterBoard() {
  const { withToast } = useWithToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('id,name,status,job_applied')
        .limit(200);
      if (!mounted) return;
      if (!error) setRows(data || []);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const updateStatus = async (id, status) => {
    const prev = rows;
    setRows((r) => r.map(x => x.id === id ? { ...x, status } : x));
    const { error } = await withToast(
      () => supabase.from('candidates').update({ status }).eq('id', id),
      { success: 'Status updated', error: 'Failed to update status' }
    );
    if (error) setRows(prev);
  };

  if (loading) return <div className="p-4"><Loader label="Loading candidates" /></div>;
  if (rows.length === 0) return <div className="p-4"><Empty title="No candidates" hint="Try expanding your filters." /></div>;

  return (
    <div className="p-4 space-y-2">
      {rows.map((r) => (
        <div key={r.id} className="border rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-gray-600">Applied: {r.job_applied ?? '—'}</div>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={r.status || 'Applied'}
              onChange={(e) => updateStatus(r.id, e.target.value)}
              aria-label={`Change status for ${r.name}`}
            >
              {['Applied','Screening','Interview','Offer','Placed','Rejected'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
