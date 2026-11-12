import React, { useEffect, useState } from 'react';
import Loader from '@/components/ui/Loader.jsx';
import Empty from '@/components/ui/Empty.jsx';
import AccessDenied from '@/components/ui/AccessDenied.jsx';
import { useWithToast } from '@/utils/withToast.js';
import {
  getCandidates, normalizeStatus, getAllowedTransitions,
  changeCandidateStatus, getCandidateById,
} from '@/utils/storage';
import { fetchApplications, syncCandidateToSupabase, isRlsDenied } from '@/lib/pipeline';
import { useToasts } from '@/components/ui/ToastProvider.jsx';

const PIPELINE_STATUSES = ['Applied', 'Reviewed', 'Submitted', 'Interview', 'Hired', 'Rejected'];

// Slice 1 (thin): the board reads Supabase applications (shared pipeline)
// with a demo-store fallback. Status changes still go through the demo row
// (transition rules enforced), then sync to Supabase. This also replaces the
// old board's broken `job_applied` select and its Supabase-only status words.
function attachDemoTwins(apps) {
  const demoRows = getCandidates();
  return apps.map((a) => {
    const twin = demoRows.find((d) => String(d.supabaseApplicationId) === String(a.id))
      || demoRows.find((d) => (d.email || '').trim().toLowerCase() === (a.email || '').trim().toLowerCase()
        && String(d.submittedJobId) === String(a.legacyJobId));
    return { ...a, demoCandidateId: twin ? twin.id : null };
  });
}

function mapDemoRow(c) {
  return {
    id: c.id,
    demoCandidateId: c.id,
    name: c.name,
    email: c.email || '',
    jobTitle: null,
    status: normalizeStatus(c.status),
  };
}

export default function RecruiterBoard() {
  const { withToast } = useWithToast();
  const { addToast } = useToasts();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  // Slice 7: an RLS denial is not an outage — show the denied state and
  // never fall back to the unscoped demo store.
  const [denied, setDenied] = useState(false);

  const load = async () => {
    try {
      const apps = await fetchApplications();
      setRows(attachDemoTwins(apps));
      setUsingFallback(false);
    } catch (err) {
      if (isRlsDenied(err)) { setDenied(true); setRows([]); }
      else { setRows(getCandidates().map(mapDemoRow)); setUsingFallback(true); }
    }
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    (async () => { if (mounted) await load(); })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (applicationId, status) => {
    const row = rows.find((r) => String(r.id) === String(applicationId));
    const demoId = row?.demoCandidateId;
    if (!demoId) {
      addToast({ type: 'error', message: 'Could not find the local record for this application.' });
      return;
    }
    const prev = rows;
    setRows((r) => r.map((x) => (String(x.id) === String(applicationId) ? { ...x, status } : x)));
    const result = changeCandidateStatus(demoId, status, {});
    if (!result) {
      setRows(prev);
      addToast({ type: 'error', message: 'Status transition not allowed.' });
      return;
    }
    const updated = getCandidateById(demoId);
    if (updated) {
      await withToast(
        () => syncCandidateToSupabase(updated).then((res) => {
          if (res === 'failed') throw new Error('sync failed');
          return res;
        }),
        { success: 'Status updated', error: 'Saved locally; shared sync failed' }
      );
    }
    await load();
  };

  if (loading) return <div className="p-4"><Loader label="Loading candidates" /></div>;
  if (denied) return <AccessDenied />;
  if (rows.length === 0) return <div className="p-4"><Empty title="No candidates" hint="Try expanding your filters." /></div>;

  return (
    <div className="p-4 space-y-2">
      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          Showing local demo data — the shared pipeline is unreachable right now. Changes here will sync when it comes back.
        </p>
      )}
      {rows.map((r) => {
        const status = normalizeStatus(r.status);
        const allowed = getAllowedTransitions(status);
        const options = [...PIPELINE_STATUSES];
        if (!options.includes(status)) options.push(status);
        return (
          <div key={r.id} className="border rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-xs text-gray-600">
                {r.jobTitle ? `Applied: ${r.jobTitle}` : ''}{r.email ? ` · ${r.email}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="border rounded px-2 py-1 text-sm"
                value={status}
                disabled={allowed.length === 0}
                onChange={(e) => updateStatus(r.id, e.target.value)}
                aria-label={`Change status for ${r.name}`}
              >
                {options.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
}
