import React, { useEffect, useState } from 'react';
import { fetchApplications, reconcilePipeline } from '@/lib/pipeline';
import {
  getCandidates, getJobById, getClientById,
  clientDecideCandidate, changeCandidateStatus, normalizeStatus,
} from '@/utils/storage';
import { useToasts } from '@/components/ui/ToastProvider.jsx';

// Slice 6 (thin): client approvals read the SAME applications the demo
// flow writes — one approval system, not two. The old page read the
// job_candidates table, which nothing ever wrote to (0 rows), so it always
// showed "No items found." Approvals now list applications with status
// Submitted (or Interview with no decision yet), with the job title and
// client name. Decisions still go through the demo store (the canonical
// write path) and sync up from there via the existing queueSync.
function toRow(a) {
  return {
    id: a.id,
    demoCandidateId: a.legacyCandidateId || null,
    candidateName: a.name,
    candidateEmail: a.email || '',
    jobTitle: a.jobTitle,
    clientName: a.clientName,
    status: a.status,
    clientDecision: a.clientDecision || null,
    submittedAt: a.submittedAt || null,
  };
}

function mapDemoRow(c) {
  const job = c.submittedJobId ? getJobById(c.submittedJobId) : null;
  const client = job ? getClientById(job.clientId) : null;
  return {
    id: c.id,
    demoCandidateId: c.id,
    candidateName: c.name,
    candidateEmail: c.email || '',
    jobTitle: job?.title || '—',
    clientName: client?.name || '—',
    status: normalizeStatus(c.status),
    clientDecision: c.clientDecision || null,
    submittedAt: c.submittedAt || null,
  };
}

function awaitingReview(row) {
  if (row.clientDecision) return false;
  return row.status === 'Submitted' || row.status === 'Interview';
}

export default function Approvals() {
  const { addToast } = useToasts();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [rejectRow, setRejectRow] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const loadFromSupabase = async () => {
    const apps = await fetchApplications();
    setRows(apps.map(toRow).filter(awaitingReview));
    reconcilePipeline()
      .then((fresh) => {
        setRows(fresh.map(toRow).filter(awaitingReview));
      })
      .catch(() => {});
  };

  const loadFromDemo = () => {
    setRows(
      getCandidates()
        .filter((c) => c.submittedJobId && awaitingReview(mapDemoRow(c)))
        .map(mapDemoRow)
    );
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadFromSupabase();
        if (mounted) setUsingFallback(false);
      } catch {
        try {
          const fresh = await reconcilePipeline();
          if (!mounted) return;
          setRows(fresh.map(toRow).filter(awaitingReview));
          setUsingFallback(false);
        } catch {
          if (mounted) { loadFromDemo(); setUsingFallback(true); }
        }
      }
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve the demo candidate id for a decision; reconcile first if the
  // row has no demo twin yet.
  const resolveDemoCandidateId = async (row) => {
    if (row.demoCandidateId) return row.demoCandidateId;
    try {
      const fresh = await reconcilePipeline();
      const match = fresh.map(toRow).find((r) => String(r.id) === String(row.id));
      return match?.demoCandidateId || null;
    } catch {
      return null;
    }
  };

  const decide = async (row, decision, note) => {
    const demoCandidateId = await resolveDemoCandidateId(row);
    if (!demoCandidateId) {
      addToast({ type: 'error', message: 'That candidate is not in local demo data yet — reload the page and try again.' });
      return;
    }
    const result = clientDecideCandidate(demoCandidateId, decision, { note });
    if (!result) {
      addToast({ type: 'error', message: 'Could not record the decision.' });
      return;
    }
    // Approved/Rejected leave the queue; the decision syncs to Supabase
    // via the existing queueSync in clientDecideCandidate.
    setRows((prev) => prev.filter((r) => r.id !== row.id));
    addToast({ type: 'success', message: decision === 'Approved' ? 'Candidate approved.' : 'Candidate rejected.' });
  };

  const markInterview = async (row) => {
    const demoCandidateId = await resolveDemoCandidateId(row);
    if (!demoCandidateId) {
      addToast({ type: 'error', message: 'That candidate is not in local demo data yet — reload the page and try again.' });
      return;
    }
    changeCandidateStatus(demoCandidateId, 'Interview');
    // Interview keeps the row in the queue (still awaiting a decision).
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: 'Interview' } : r)));
    addToast({ type: 'success', message: 'Marked for interview.' });
  };

  const handleRejectConfirm = () => {
    if (!rejectNote.trim()) {
      addToast({ type: 'error', message: 'Please provide a rejection reason.' });
      return;
    }
    const row = rejectRow;
    setRejectRow(null);
    setRejectNote('');
    decide(row, 'Rejected', rejectNote.trim());
  };

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Client Approvals</h1>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared applications are unreachable right now. Decisions here will sync when they come back.
        </p>
      )}

      <div className="grid gap-2">
        {rows.map(r => (
          <div key={r.id} className="border rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.candidateName}</div>
              <div className="text-sm text-gray-600">Job: {r.jobTitle} &middot; {r.clientName}</div>
              <div className="text-xs text-gray-500">Status: {r.status}{r.submittedAt ? ` · Submitted ${new Date(r.submittedAt).toLocaleDateString()}` : ''}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => decide(r, 'Approved')}>Approve</button>
              <button className="px-3 py-1 text-sm border rounded" onClick={() => markInterview(r)}>Interview</button>
              <button className="px-3 py-1 text-sm border rounded bg-red-600 text-white hover:bg-red-700" onClick={() => { setRejectRow(r); setRejectNote(''); }}>Reject</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-gray-600">No items found.</div>}
      </div>

      {rejectRow && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Reject Candidate</h3>
            <p className="text-sm text-gray-600 mb-3">Please provide a reason for rejection:</p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm h-24 resize-none"
              placeholder="Enter rejection reason..."
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setRejectRow(null); setRejectNote(''); }}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 font-medium"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
