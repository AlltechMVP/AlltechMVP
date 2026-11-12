import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCandidates, getJobById, normalizeStatus,
  getAllowedTransitions, changeCandidateStatus,
  setAssignmentPrefill, getCandidateById,
} from '@/utils/storage';
import {
  fetchApplications, reconcilePipeline, syncCandidateToSupabase,
} from '@/lib/pipeline';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty } from '@/components/ui';
import { useToasts } from '@/components/ui/ToastProvider.jsx';
import { useNavigate } from 'react-router-dom';

const FILTER_OPTIONS = ['All', 'Applied', 'Reviewed', 'Submitted', 'Interview', 'Hired', 'Rejected', 'Active Assignment', 'Assignment Ended'];

const STATUS_COLORS = {
  'Applied': 'bg-gray-100 text-gray-800',
  'Reviewed': 'bg-blue-100 text-blue-800',
  'Submitted': 'bg-indigo-100 text-indigo-800',
  'Interview': 'bg-purple-100 text-purple-800',
  'Hired': 'bg-emerald-100 text-emerald-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Assigned': 'bg-cyan-100 text-cyan-800',
  'Active Assignment': 'bg-green-100 text-green-800',
  'Assignment Ended': 'bg-orange-100 text-orange-800',
};

const ACTION_LABELS = {
  'Reviewed': { label: 'Mark Reviewed', cls: 'bg-blue-600 hover:bg-blue-700' },
  'Submitted': { label: 'Submit to Client', cls: 'bg-indigo-600 hover:bg-indigo-700' },
  'Interview': { label: 'Schedule Interview', cls: 'bg-purple-600 hover:bg-purple-700' },
  'Hired': { label: 'Mark Hired', cls: 'bg-emerald-600 hover:bg-emerald-700' },
  'Rejected': { label: 'Reject', cls: 'bg-red-600 hover:bg-red-700' },
};

// Slice 1 (thin): the pipeline reads Supabase (shared across sessions) with
// a demo-store fallback when Supabase is unreachable. Writes still go to the
// demo store as today, then sync to Supabase (best-effort). Each row carries
// demoCandidateId so actions keep working on the demo row; the assignment
// prefill uses demo ids because the assignment form still reads demo store.
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
  const job = c.submittedJobId ? getJobById(c.submittedJobId) : null;
  return {
    id: c.id,
    demoCandidateId: c.id,
    name: c.name,
    email: c.email || '-',
    job: job?.title || '-',
    status: normalizeStatus(c.status),
    lastAction: c.lastActionAt ? new Date(c.lastActionAt).toLocaleDateString() : '-',
    _sortDate: c.lastActionAt || c.createdAt || '',
    legacyJobId: c.submittedJobId || null,
    clientDecision: c.clientDecision || null,
    clientDecisionNote: c.clientDecisionNote || '',
    clientDecidedAt: c.clientDecidedAt || null,
  };
}

function deriveDecisions(rows, days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return rows
    .filter((r) => r.clientDecision && r.clientDecidedAt && new Date(r.clientDecidedAt) >= cutoff)
    .map((r) => ({
      applicationId: r.id,
      demoCandidateId: r.demoCandidateId,
      candidateName: r.name,
      jobId: r.legacyJobId,
      jobTitle: r.job,
      decision: r.clientDecision,
      note: r.clientDecisionNote,
      decidedAt: r.clientDecidedAt,
    }));
}

export default function CandidatesList() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [data, setData] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [showDecisions, setShowDecisions] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const { addToast } = useToasts();
  const navigate = useNavigate();

  const toRows = (list) => attachDemoTwins(list).map((a) => ({
    ...a,
    job: a.jobTitle,
    lastAction: a.lastActionAt ? new Date(a.lastActionAt).toLocaleDateString() : '-',
    _sortDate: a.lastActionAt || a.createdAt || '',
  }));

  const loadFromSupabase = async () => {
    // Render fast from Supabase, then reconcile in the background (pushes
    // this browser's demo rows up, creates missing twins) and refresh.
    const apps = await fetchApplications();
    const rows = toRows(apps);
    setData(rows);
    setDecisions(deriveDecisions(rows));
    reconcilePipeline()
      .then((fresh) => {
        const next = toRows(fresh);
        setData(next);
        setDecisions(deriveDecisions(next));
      })
      .catch(() => {});
  };

  const loadFromDemo = () => {
    const rows = getCandidates().map(mapDemoRow);
    setData(rows);
    setDecisions(deriveDecisions(rows));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadFromSupabase();
        if (mounted) setUsingFallback(false);
      } catch {
        // The shared fetch failed: try the reconcile (it re-syncs and
        // re-fetches) before falling back to local demo data.
        try {
          const apps = await reconcilePipeline();
          if (!mounted) return;
          const rows = toRows(apps);
          setData(rows);
          setDecisions(deriveDecisions(rows));
          setUsingFallback(false);
        } catch {
          if (mounted) { loadFromDemo(); setUsingFallback(true); }
        }
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateAssignment = (demoCandidateId, legacyJobId) => {
    setAssignmentPrefill(demoCandidateId, legacyJobId);
    navigate('/assignments/new');
  };

  const handleAction = async (applicationId, newStatus) => {
    let note;
    if (newStatus === 'Rejected') {
      note = prompt('Rejection reason:');
      if (note === null) return;
    }
    const row = data.find((r) => String(r.id) === String(applicationId));
    const demoId = row?.demoCandidateId;
    if (!demoId) {
      addToast({ type: 'error', message: 'Could not find the local record for this application.' });
      return;
    }
    const result = changeCandidateStatus(demoId, newStatus, { note });
    if (result) {
      const updated = getCandidateById(demoId);
      if (updated) syncCandidateToSupabase(updated).catch(() => {});
      try {
        const apps = await fetchApplications();
        const rows = toRows(apps);
        setData(rows);
        setDecisions(deriveDecisions(rows));
        setUsingFallback(false);
      } catch {
        loadFromDemo();
        setUsingFallback(true);
      }
      addToast({ type: 'success', message: `Candidate status updated to "${result}".` });
    } else {
      addToast({ type: 'error', message: 'Status transition not allowed.' });
    }
  };

  const rows = useMemo(() => {
    let items = data;
    if (statusFilter !== 'All') {
      items = items.filter(c => normalizeStatus(c.status) === statusFilter);
    }
    return items.map(c => {
      const status = normalizeStatus(c.status);
      return {
        id: c.id,
        name: c.name,
        email: c.email || '-',
        job: c.job || '-',
        status,
        lastAction: c.lastAction || '-',
        _sortDate: c._sortDate || '',
        allowed: getAllowedTransitions(status),
        demoCandidateId: c.demoCandidateId,
      };
    }).sort((a, b) => (b._sortDate || '').localeCompare(a._sortDate || ''));
  }, [data, statusFilter]);

  const columns = [
    { key: 'name', header: 'Candidate', render: (v, row) => (
      <Link to={`/candidates/${row.id}`} className="text-blue-600 hover:underline font-medium">{v}</Link>
    )},
    { key: 'email', header: 'Email' },
    { key: 'job', header: 'Job' },
    { key: 'status', header: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v] || 'bg-gray-100 text-gray-800'}`}>{v}</span>
    )},
    { key: 'lastAction', header: 'Last Action' },
    { key: 'id', header: 'Actions', render: (_, row) => {
      if (row.allowed.length === 0) {
        return <span className="text-xs text-gray-400 italic">No actions available</span>;
      }
      return (
        <div className="flex gap-1 flex-wrap">
          {row.allowed.map(s => {
            const isReopen = s === 'Reviewed' && row.status === 'Rejected';
            const a = isReopen
              ? { label: 'Reopen', cls: 'bg-yellow-500 hover:bg-yellow-600' }
              : ACTION_LABELS[s];
            if (!a) return null;
            return (
              <button
                key={s}
                onClick={() => handleAction(row.id, s)}
                className={`text-white px-2 py-1 rounded text-xs font-medium ${a.cls}`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      );
    }},
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Candidate Pipeline</h1>
      </div>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared pipeline is unreachable right now. Changes here will sync when it comes back.
        </p>
      )}

      {decisions.length > 0 && showDecisions && (
        <div className="mb-6 border border-blue-200 rounded-xl bg-blue-50/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-blue-100/60 border-b border-blue-200">
            <h2 className="text-sm font-semibold text-blue-900">Client Decisions ({decisions.length})</h2>
            <button onClick={() => setShowDecisions(false)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Dismiss</button>
          </div>
          <div className="divide-y divide-blue-100">
            {decisions.map(d => (
              <div key={d.applicationId} className="px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{d.candidateName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.decision === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {d.decision}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {d.jobTitle} &middot; {d.decidedAt ? new Date(d.decidedAt).toLocaleDateString() : ''}
                    {d.note && <span className="ml-2 italic text-gray-400">&quot;{d.note}&quot;</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {d.decision === 'Approved' ? (
                    <button
                      onClick={() => handleCreateAssignment(d.demoCandidateId, d.jobId)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                    >
                      Create Assignment
                    </button>
                  ) : (
                    <Link
                      to={`/candidates/${d.applicationId}`}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                    >
                      View Candidate
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {FILTER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <Empty title="No candidates found" hint="Candidates will appear here as they enter the pipeline." />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={10} />
      )}
    </div>
  );
}
