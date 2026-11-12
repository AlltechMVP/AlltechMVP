import React, { useState, useEffect, useMemo } from 'react';
import {
  getDemoClientId, getTimesheetsForClient,
  getAssignmentById, getCandidateById, getJobById, getClientById,
  clientDecideTimesheet, getTimesheets
} from '@/utils/storage';
import { fetchTimesheets, reconcileTimesheets, isRlsDenied } from '@/lib/pipeline';
import { useAuth } from '@/context/AuthContext.jsx';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty, AccessDenied } from '@/components/ui';
import { useToasts } from '@/components/ui/ToastProvider.jsx';

const CLIENT_STATUS_COLORS = {
  'Not Submitted': 'bg-gray-100 text-gray-800',
  'Submitted': 'bg-blue-100 text-blue-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
};

// Slice 7 (thin): timecard approvals read Supabase timesheets (shared
// across sessions, RLS-filtered to the signed-in client's company) with a
// demo-store fallback filtered to the client's company when Supabase is
// unreachable. Decisions still go through the demo store (the canonical
// write path) and sync up from there via queueTimesheetSync in
// clientDecideTimesheet. Each row carries demoTimesheetId so decisions
// keep working on the demo row.
function attachDemoTwins(timesheets) {
  const demoRows = getTimesheets();
  return timesheets.map((t) => {
    const twin = demoRows.find((d) => String(d.supabaseTimesheetId) === String(t.id))
      || demoRows.find((d) => String(d.id) === String(t.legacyId));
    return { ...t, demoTimesheetId: twin ? twin.id : null };
  });
}

function toRow(t) {
  return {
    id: t.id,
    demoTimesheetId: t.demoTimesheetId || null,
    candidateName: t.candidateName,
    jobTitle: t.jobTitle,
    weekEnding: t.weekEnding || '-',
    totalHours: t.totalHours ?? 0,
    clientStatus: t.clientApprovalStatus || 'Not Submitted',
    clientDecidedAt: t.clientDecidedAt || null,
    clientDecisionNote: t.approverNote || '',
    _sortDate: t.clientDecidedAt || t.updatedAt || t.createdAt || '',
  };
}

function mapDemoRow(t) {
  const assignment = getAssignmentById(t.assignmentId);
  const candidate = assignment ? getCandidateById(assignment.candidateId) : null;
  const job = assignment ? getJobById(assignment.jobId) : null;
  return {
    id: t.id,
    demoTimesheetId: t.id,
    candidateName: candidate?.name || 'Unknown',
    jobTitle: job?.title || 'Unknown',
    weekEnding: t.weekEnding || '-',
    totalHours: t.totalHours ?? 0,
    clientStatus: t.clientApprovalStatus || 'Not Submitted',
    clientDecidedAt: t.clientDecidedAt || null,
    clientDecisionNote: t.clientDecisionNote || '',
    _sortDate: t.submittedAt || t.updatedAt || t.createdAt || '',
  };
}

export default function ClientTimecards() {
  const { addToast } = useToasts();
  const { profile } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [client, setClient] = useState(null);
  const [filter, setFilter] = useState('Pending');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);
  // Slice 7: an RLS denial is not an outage — show the denied state and
  // never fall back to the unscoped demo store.
  const [denied, setDenied] = useState(false);

  // The demo fallback client is the signed-in user's company: profiles
  // client_id 1-4 maps to the seeded demo ids client-001..004. Unknown
  // (no client link yet) falls back to the demo client.
  const demoClientId = useMemo(() => {
    const cid = profile?.client_id;
    if (cid !== undefined && cid !== null && cid !== '') {
      return `client-${String(cid).padStart(3, '0')}`;
    }
    return getDemoClientId();
  }, [profile?.client_id]);

  const loadFromSupabase = async () => {
    // Render fast from Supabase (RLS filters to the client's company),
    // then reconcile in the background and refresh.
    const rows = await fetchTimesheets();
    setTimesheets(attachDemoTwins(rows).map(toRow));
    setClient(getClientById(demoClientId));
    reconcileTimesheets()
      .then((fresh) => {
        setTimesheets(attachDemoTwins(fresh).map(toRow));
      })
      .catch(() => {});
  };

  const loadFromDemo = () => {
    setClient(getClientById(demoClientId));
    setTimesheets(getTimesheetsForClient(demoClientId).map(mapDemoRow));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadFromSupabase();
        if (mounted) setUsingFallback(false);
      } catch (err) {
        if (isRlsDenied(err)) { if (mounted) setDenied(true); return; }
        // The shared fetch failed: try the reconcile (it re-syncs and
        // re-fetches) before falling back to local demo data.
        try {
          const rows = await reconcileTimesheets();
          if (!mounted) return;
          setTimesheets(attachDemoTwins(rows).map(toRow));
          setClient(getClientById(demoClientId));
          setUsingFallback(false);
        } catch (err2) {
          if (isRlsDenied(err2)) { if (mounted) setDenied(true); return; }
          if (mounted) { loadFromDemo(); setUsingFallback(true); }
        }
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoClientId]);

  // Resolve the demo timesheet id for a decision; reconcile first if the
  // row has no demo twin yet.
  const resolveDemoTimesheetId = async (row) => {
    if (row.demoTimesheetId) return row.demoTimesheetId;
    try {
      const fresh = await reconcileTimesheets();
      const match = attachDemoTwins(fresh).find((t) => String(t.id) === String(row.id));
      return match?.demoTimesheetId || null;
    } catch {
      return null;
    }
  };

  const rows = useMemo(() => {
    let items = timesheets;

    if (filter === 'Pending') {
      items = items.filter(r => r.clientStatus === 'Submitted');
    } else if (filter === 'Approved') {
      items = items.filter(r => r.clientStatus === 'Approved');
    } else if (filter === 'Rejected') {
      items = items.filter(r => r.clientStatus === 'Rejected');
    }

    return items.sort((a, b) => (b._sortDate || '').localeCompare(a._sortDate || ''));
  }, [timesheets, filter]);

  const handleApprove = async (row) => {
    const demoId = await resolveDemoTimesheetId(row);
    if (!demoId) {
      addToast({ type: 'error', message: 'That timecard is not in local demo data yet — reload the page and try again.' });
      return;
    }
    const result = clientDecideTimesheet(demoId, 'Approved');
    if (result) {
      addToast({ type: 'success', message: 'Timecard approved.' });
      // Update the row in place — do not refetch, the sync may not have
      // landed yet and a stale fetch would overwrite the new status.
      setTimesheets((prev) => prev.map((t) => (t.id === row.id
        ? { ...t, clientStatus: 'Approved', clientDecidedAt: new Date().toISOString() }
        : t)));
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectNote.trim()) {
      addToast({ type: 'error', message: 'Please provide a rejection reason.' });
      return;
    }
    const row = rejectModal;
    const demoId = await resolveDemoTimesheetId(row);
    if (!demoId) {
      addToast({ type: 'error', message: 'That timecard is not in local demo data yet — reload the page and try again.' });
      return;
    }
    const result = clientDecideTimesheet(demoId, 'Rejected', { note: rejectNote.trim() });
    if (result) {
      addToast({ type: 'success', message: 'Timecard rejected.' });
      setRejectModal(null);
      setRejectNote('');
      setTimesheets((prev) => prev.map((t) => (t.id === row.id
        ? { ...t, clientStatus: 'Rejected', clientDecisionNote: rejectNote.trim(), clientDecidedAt: new Date().toISOString() }
        : t)));
    }
  };

  const columns = [
    { key: 'candidateName', header: 'Candidate', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'jobTitle', header: 'Job' },
    { key: 'weekEnding', header: 'Week Ending' },
    { key: 'totalHours', header: 'Total Hours', render: (v) => <span className="font-medium">{v}h</span> },
    { key: 'clientStatus', header: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CLIENT_STATUS_COLORS[v] || 'bg-gray-100 text-gray-800'}`}>{v}</span>
    )},
    { key: 'id', header: 'Actions', render: (_, row) => {
      if (row.clientStatus !== 'Submitted') {
        if (row.clientStatus === 'Approved') {
          return <span className="text-xs text-green-600 italic">Approved {row.clientDecidedAt ? new Date(row.clientDecidedAt).toLocaleDateString() : ''}</span>;
        }
        if (row.clientStatus === 'Rejected') {
          return (
            <span className="text-xs text-red-600 italic" title={row.clientDecisionNote || ''}>
              Rejected {row.clientDecisionNote ? `- ${row.clientDecisionNote.slice(0, 30)}${row.clientDecisionNote.length > 30 ? '...' : ''}` : ''}
            </span>
          );
        }
        return <span className="text-xs text-gray-400">Not submitted</span>;
      }
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleApprove(row)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-medium"
          >
            Approve
          </button>
          <button
            onClick={() => { setRejectModal(row); setRejectNote(''); }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
          >
            Reject
          </button>
        </div>
      );
    }},
  ];

  if (denied) {
    return <AccessDenied />;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Timecard Approvals</h1>
          {client && <p className="text-sm text-gray-500 mt-1">{client.name}</p>}
        </div>
      </div>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared timesheets are unreachable right now. Decisions here will sync when they come back.
        </p>
      )}

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Show:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {['All', 'Pending', 'Approved', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-gray-400">{rows.length} timecard(s)</span>
      </div>

      {rows.length === 0 ? (
        <Empty title="No timecards awaiting approval" hint="Timecards submitted for your jobs will appear here." />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={10} />
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Reject Timecard</h3>
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
                onClick={() => { setRejectModal(null); setRejectNote(''); }}
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
