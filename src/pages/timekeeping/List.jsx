import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTimesheets, getAssignmentById, getCandidateById, getJobById } from '@/utils/storage';
import { fetchTimesheets, reconcileTimesheets, isRlsDenied } from '@/lib/pipeline';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty, AccessDenied } from '@/components/ui';

const STATUS_OPTIONS = ['All', 'Draft', 'Submitted', 'Approved', 'Rejected'];
const CLIENT_FILTER_OPTIONS = ['All', 'Awaiting Client', 'Client Approved', 'Client Rejected', 'Not Submitted'];

// Slice 3 (thin): the timesheets list reads Supabase (shared across
// sessions) with a demo-store fallback when Supabase is unreachable.
// Writes still go to the demo store (Form.jsx) and sync up from there.
// Each row carries demoTimesheetId so the View link opens the demo row
// the timesheet form works on.
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
    candidate: t.candidateName,
    job: t.jobTitle,
    weekEnding: t.weekEnding || '-',
    totalHours: t.totalHours ?? 0,
    status: t.status,
    clientApproval: t.clientApprovalStatus || 'Not Submitted',
    payrollStatus: t.payrollStatus || 'Not Ready',
    updated: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : '-',
    _sortDate: t.updatedAt || t.createdAt || '',
  };
}

function mapDemoRow(t) {
  const assignment = getAssignmentById(t.assignmentId);
  const cand = assignment ? getCandidateById(assignment.candidateId) : null;
  const job = assignment ? getJobById(assignment.jobId) : null;
  return {
    id: t.id,
    demoTimesheetId: t.id,
    candidate: cand?.name || '-',
    job: job?.title || '-',
    weekEnding: t.weekEnding || '-',
    totalHours: t.totalHours ?? 0,
    status: t.status,
    clientApproval: t.clientApprovalStatus || 'Not Submitted',
    payrollStatus: t.payrollStatus || 'Not Ready',
    updated: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : '-',
    _sortDate: t.updatedAt || t.createdAt || '',
  };
}

export default function TimesheetsList() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [clientFilter, setClientFilter] = useState('All');
  const [data, setData] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  // Slice 7: an RLS denial is not an outage — show the denied state and
  // never fall back to the unscoped demo store.
  const [denied, setDenied] = useState(false);

  const loadFromSupabase = async () => {
    // Render fast from Supabase, then reconcile in the background (pushes
    // this browser's demo rows up, creates missing twins) and refresh.
    const rows = await fetchTimesheets();
    setData(attachDemoTwins(rows).map(toRow));
    reconcileTimesheets()
      .then((fresh) => {
        setData(attachDemoTwins(fresh).map(toRow));
      })
      .catch(() => {});
  };

  const loadFromDemo = () => {
    setData(getTimesheets().map(mapDemoRow));
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
          setData(attachDemoTwins(rows).map(toRow));
          setUsingFallback(false);
        } catch (err2) {
          if (isRlsDenied(err2)) { if (mounted) setDenied(true); return; }
          if (mounted) { loadFromDemo(); setUsingFallback(true); }
        }
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    let items = data;
    if (statusFilter !== 'All') {
      items = items.filter(t => t.status === statusFilter);
    }
    if (clientFilter !== 'All') {
      items = items.filter(t => {
        const cs = t.clientApproval || 'Not Submitted';
        if (clientFilter === 'Awaiting Client') return cs === 'Submitted';
        if (clientFilter === 'Client Approved') return cs === 'Approved';
        if (clientFilter === 'Client Rejected') return cs === 'Rejected';
        if (clientFilter === 'Not Submitted') return cs === 'Not Submitted';
        return true;
      });
    }
    return [...items].sort((a, b) => (b._sortDate || '').localeCompare(a._sortDate || ''));
  }, [data, statusFilter, clientFilter]);

  const payrollColors = {
    'Not Ready': 'bg-gray-100 text-gray-800',
    'Ready': 'bg-emerald-100 text-emerald-800',
    'In Payroll': 'bg-indigo-100 text-indigo-800',
    'Paid': 'bg-green-100 text-green-800',
  };

  const clientApprovalColors = {
    'Not Submitted': 'bg-gray-100 text-gray-500',
    'Submitted': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
  };

  const columns = [
    { key: 'candidate', header: 'Candidate' },
    { key: 'job', header: 'Job' },
    { key: 'weekEnding', header: 'Week Ending' },
    { key: 'totalHours', header: 'Hours' },
    { key: 'status', header: 'Status', render: (v) => {
      const colors = {
        Draft: 'bg-gray-100 text-gray-800',
        Submitted: 'bg-blue-100 text-blue-800',
        Approved: 'bg-green-100 text-green-800',
        Rejected: 'bg-red-100 text-red-800',
      };
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[v] || ''}`}>{v}</span>;
    }},
    { key: 'clientApproval', header: 'Client', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${clientApprovalColors[v] || ''}`}>{v === 'Not Submitted' ? '-' : v}</span>
    )},
    { key: 'payrollStatus', header: 'Payroll', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payrollColors[v] || ''}`}>{v}</span>
    )},
    { key: 'id', header: '', render: (_, row) => (
      <Link to={`/timekeeping/${row.demoTimesheetId || row.id}`} className="text-blue-600 hover:underline text-xs">View</Link>
    )},
  ];

  if (denied) {
    return <AccessDenied />;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Timesheets</h1>
        <Link
          to="/timekeeping/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Create Timesheet
        </Link>
      </div>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared timesheets are unreachable right now. Changes here will sync when they come back.
        </p>
      )}

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <label className="text-sm text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="text-sm text-gray-600 ml-2">Client:</label>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {CLIENT_FILTER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <Empty title="No timesheets found" hint="Create your first timesheet to get started." />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={10} />
      )}
    </div>
  );
}
