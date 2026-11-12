import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useWithToast } from '@/utils/withToast.js';

export default function Approvals() {
  const { withToast } = useWithToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from('job_candidates')
        .select('id, job_id, candidate_id, status, candidates(name)')
        .in('status', ['Submitted to Client', 'Interview Pending', 'Approved by Client']);
      if (!mounted) return;
      if (!error && Array.isArray(data)) {
        const mapped = data.map(d => ({
          relId: d.id,
          jobId: d.job_id,
          candidateId: d.candidate_id,
          candidateName: d.candidates?.name ?? d.candidate_id,
          status: d.status,
        }));
        setRows(mapped);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const updateStatus = async (relId, next) => {
    const prev = rows;
    setRows(prevRows => prevRows.map(r => r.relId === relId ? { ...r, status: next } : r));
    const { error } = await withToast(
      () => supabase.from('job_candidates').update({ status: next }).eq('id', relId),
      { success: 'Updated status', error: 'Failed to update status' }
    );
    if (error) setRows(prev);
  };

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Client Approvals</h1>
      <div className="grid gap-2">
        {rows.map(r => (
          <div key={r.relId} className="border rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.candidateName}</div>
              <div className="text-sm text-gray-600">Job: {r.jobId}</div>
              <div className="text-xs text-gray-500">Status: {r.status}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border rounded" onClick={() => updateStatus(r.relId, 'Approved by Client')}>Approve</button>
              <button className="px-3 py-1 text-sm border rounded" onClick={() => updateStatus(r.relId, 'Interview Pending')}>Interview</button>
              <button className="px-3 py-1 text-sm border rounded" onClick={() => updateStatus(r.relId, 'Rejected by Client')}>Reject</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-gray-600">No items found.</div>}
      </div>
    </div>
  );
}
