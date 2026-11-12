import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssignments, getCandidateById, getJobById } from '@/utils/storage';
import { fetchAssignments, reconcileAssignments } from '@/lib/pipeline';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty } from '@/components/ui';

const STATUS_OPTIONS = ['All', 'Active', 'Ended', 'On Hold'];

// Slice 2 (thin): the assignments list reads Supabase (shared across
// sessions) with a demo-store fallback when Supabase is unreachable.
// Writes still go to the demo store (Form.jsx) and sync up from there.
// Each row carries demoAssignmentId so the Edit link opens the demo row
// the assignment form works on.
function attachDemoTwins(assignments) {
  const demoRows = getAssignments();
  return assignments.map((a) => {
    const twin = demoRows.find((d) => String(d.supabaseAssignmentId) === String(a.id))
      || demoRows.find((d) => String(d.id) === String(a.legacyId));
    return { ...a, demoAssignmentId: twin ? twin.id : null };
  });
}

function toRow(a) {
  return {
    id: a.id,
    demoAssignmentId: a.demoAssignmentId || null,
    candidate: a.candidateName,
    candidateStatus: a.candidateStatus,
    job: a.jobTitle,
    startDate: a.startDate || '-',
    status: a.status,
    payRate: a.payRate != null ? `$${a.payRate}` : '-',
    billRate: a.billRate != null ? `$${a.billRate}` : '-',
    updated: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : '-',
    _sortDate: a.updatedAt || a.createdAt || '',
  };
}

function mapDemoRow(a) {
  const cand = getCandidateById(a.candidateId);
  const job = getJobById(a.jobId);
  return {
    id: a.id,
    demoAssignmentId: a.id,
    candidate: cand?.name || a.candidateId,
    candidateStatus: cand?.status || '-',
    job: job?.title || a.jobId,
    startDate: a.startDate || '-',
    status: a.status,
    payRate: a.payRate != null ? `$${a.payRate}` : '-',
    billRate: a.billRate != null ? `$${a.billRate}` : '-',
    updated: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : '-',
    _sortDate: a.updatedAt || a.createdAt || '',
  };
}

export default function AssignmentsList() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [data, setData] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);

  const loadFromSupabase = async () => {
    // Render fast from Supabase, then reconcile in the background (pushes
    // this browser's demo rows up, creates missing twins) and refresh.
    const rows = await fetchAssignments();
    setData(attachDemoTwins(rows).map(toRow));
    reconcileAssignments()
      .then((fresh) => {
        setData(attachDemoTwins(fresh).map(toRow));
      })
      .catch(() => {});
  };

  const loadFromDemo = () => {
    setData(getAssignments().map(mapDemoRow));
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
          const rows = await reconcileAssignments();
          if (!mounted) return;
          setData(attachDemoTwins(rows).map(toRow));
          setUsingFallback(false);
        } catch {
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
      items = items.filter(a => a.status === statusFilter);
    }
    return [...items].sort((a, b) => (b._sortDate || '').localeCompare(a._sortDate || ''));
  }, [data, statusFilter]);

  const columns = [
    { key: 'candidate', header: 'Candidate' },
    { key: 'candidateStatus', header: 'Cand. Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        v === 'Active Assignment' ? 'bg-green-100 text-green-800' :
        v === 'Assigned' ? 'bg-blue-100 text-blue-800' :
        v === 'Assignment Ended' ? 'bg-gray-100 text-gray-800' :
        'bg-purple-100 text-purple-800'
      }`}>{v}</span>
    )},
    { key: 'job', header: 'Job' },
    { key: 'startDate', header: 'Start Date' },
    { key: 'status', header: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        v === 'Active' ? 'bg-green-100 text-green-800' :
        v === 'Ended' ? 'bg-gray-100 text-gray-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>{v}</span>
    )},
    { key: 'payRate', header: 'Pay Rate' },
    { key: 'billRate', header: 'Bill Rate' },
    { key: 'updated', header: 'Updated' },
    { key: 'id', header: '', render: (_, row) => (
      <Link to={`/assignments/${row.demoAssignmentId || row.id}`} className="text-blue-600 hover:underline text-xs">Edit</Link>
    )},
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Assignments</h1>
        <Link
          to="/assignments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Create Assignment
        </Link>
      </div>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared assignments are unreachable right now. Changes here will sync when they come back.
        </p>
      )}

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <Empty title="No assignments found" hint="Create your first assignment to get started." />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={10} />
      )}
    </div>
  );
}
