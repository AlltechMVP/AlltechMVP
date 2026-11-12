import React, { useState, useMemo, useEffect } from 'react';
import {
  getTimesheets, setTimesheets, getAssignmentById, getCandidateById, getJobById,
  createInvoicesFromPaidTimesheets,
  now
} from '@/utils/storage';
import { fetchTimesheets, reconcileTimesheets, syncTimesheetToSupabase, syncInvoiceToSupabase } from '@/lib/pipeline';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty } from '@/components/ui';
import { useToasts } from '@/components/ui/ToastProvider.jsx';

const PAYROLL_STATUS_OPTIONS = ['Ready', 'In Payroll', 'Paid'];

// Slice 4 (thin): the payroll queue reads Supabase timesheets (shared
// across sessions) with a demo-store fallback when Supabase is unreachable.
// Payroll is a status on the timesheet, not a separate record — the
// In Payroll / Paid flips still write the demo store first, then sync the
// row up (slice 3's sync already carries payroll_status). The "Create
// invoices" button still builds demo invoices; slice 5 moves invoices.
function attachDemoTwins(timesheets) {
  const demoRows = getTimesheets();
  return timesheets.map((t) => {
    const twin = demoRows.find((d) => String(d.supabaseTimesheetId) === String(t.id))
      || demoRows.find((d) => String(d.id) === String(t.legacyId));
    return { ...t, demoTimesheetId: twin ? twin.id : null };
  });
}

function toRow(t) {
  const flags = [];
  if (t.compliance?.overtimeFlag) flags.push('OT');
  if (t.compliance?.mealBreakMissing) flags.push('Meal');
  return {
    id: t.id,
    demoTimesheetId: t.demoTimesheetId || null,
    legacyId: t.legacyId || null,
    candidate: t.candidateName,
    job: t.jobTitle,
    weekEnding: t.weekEnding || '-',
    totalHours: t.totalHours ?? 0,
    flags: flags.join(', ') || '-',
    payrollStatus: t.payrollStatus || 'Not Ready',
    invoiceId: t.invoiceId || null,
    updated: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : '-',
  };
}

function mapDemoRow(t) {
  const assignment = getAssignmentById(t.assignmentId);
  const cand = assignment ? getCandidateById(assignment.candidateId) : null;
  const job = assignment ? getJobById(assignment.jobId) : null;
  const flags = [];
  if (t.compliance?.overtimeFlag) flags.push('OT');
  if (t.compliance?.mealBreakMissing) flags.push('Meal');
  return {
    id: t.id,
    demoTimesheetId: t.id,
    legacyId: null,
    candidate: cand?.name || '-',
    job: job?.title || '-',
    weekEnding: t.weekEnding || '-',
    totalHours: t.totalHours ?? 0,
    flags: flags.join(', ') || '-',
    payrollStatus: t.payrollStatus,
    invoiceId: t.invoiceId || null,
    updated: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : '-',
  };
}

export default function PayrollQueue() {
  const [statusFilter, setStatusFilter] = useState('Ready');
  const [data, setData] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const { addToast } = useToasts();

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
      } catch {
        // The shared fetch failed: try the reconcile (it re-syncs and
        // re-fetches) before falling back to local demo data.
        try {
          const rows = await reconcileTimesheets();
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

  const updatePayrollStatus = async (row, newStatus) => {
    // Resolve the demo row (the canonical write path) from the row's twin;
    // if there is no twin yet, reconcile first — it creates one.
    let all = getTimesheets();
    let idx = row.demoTimesheetId
      ? all.findIndex((t) => t.id === row.demoTimesheetId)
      : -1;
    if (idx === -1) {
      try {
        await reconcileTimesheets();
        all = getTimesheets();
        idx = all.findIndex(
          (t) => String(t.supabaseTimesheetId) === String(row.id)
            || (row.legacyId && String(t.id) === String(row.legacyId))
        );
      } catch {
        idx = -1;
      }
    }
    if (idx === -1) {
      addToast({ type: 'error', message: 'That timesheet is not in local demo data yet — reload the page and try again.' });
      return;
    }
    const updated = { ...all[idx], payrollStatus: newStatus, updatedAt: now() };
    all[idx] = updated;
    setTimesheets(all);
    // Sync the flip up (fire-and-forget; the demo write already succeeded).
    syncTimesheetToSupabase(updated);
    // Update the visible row in place — do not refetch, the sync may not
    // have landed yet and a stale fetch would overwrite the new status.
    setData((prev) => prev.map((r) => (r.id === row.id ? { ...r, payrollStatus: newStatus } : r)));
    addToast({ type: 'success', message: `Timesheet marked as "${newStatus}".` });
  };

  const billableCount = data.filter(t => t.payrollStatus === 'Paid' && !t.invoiceId && (t.totalHours || 0) > 0).length;

  const createInvoices = async () => {
    const created = createInvoicesFromPaidTimesheets();
    if (created.length === 0) {
      addToast({ type: 'info', message: 'No paid timesheets ready to invoice.' });
      return;
    }
    // Slice 5: sync the new invoices up FIRST, then the timesheets they
    // stamped. The timesheet sync resolves the invoice's Supabase id by
    // lookup, so it must wait until the invoice rows exist — syncing both
    // concurrently raced and the stamps landed as NULL (verified live
    // 2026-11-12: INV-2026-009 existed but both timesheets had
    // invoice_id NULL until a later reconcile fixed them).
    const results = await Promise.all(created.map((inv) => syncInvoiceToSupabase(inv)));
    const syncedIds = new Set(
      created.filter((_, i) => results[i] !== 'failed').map((inv) => inv.id)
    );
    getTimesheets()
      .filter((t) => t.invoiceId && syncedIds.has(t.invoiceId))
      .forEach((t) => syncTimesheetToSupabase(t));
    setData(getTimesheets().map(mapDemoRow));
    const summary = created.map(i => `${i.invoiceNumber} (${i.clientName}, $${i.total.toFixed(2)})`).join(', ');
    addToast({ type: 'success', message: `Created ${created.length} invoice${created.length > 1 ? 's' : ''}: ${summary}` });
  };

  const rows = useMemo(() => {
    return data
      .filter(t => t.payrollStatus === statusFilter)
      .sort((a, b) => (b.weekEnding || '').localeCompare(a.weekEnding || ''));
  }, [data, statusFilter]);

  const columns = [
    { key: 'candidate', header: 'Candidate' },
    { key: 'job', header: 'Job' },
    { key: 'weekEnding', header: 'Week Ending' },
    { key: 'totalHours', header: 'Total Hours' },
    { key: 'flags', header: 'Flags', render: (v) => {
      if (v === '-') return <span className="text-gray-400">-</span>;
      return <span className="text-amber-600 text-xs font-medium">{v}</span>;
    }},
    { key: 'updated', header: 'Updated' },
    { key: 'id', header: 'Actions', render: (_, row) => {
      if (row.payrollStatus === 'Ready') {
        return (
          <button
            onClick={() => updatePayrollStatus(row, 'In Payroll')}
            className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-indigo-700"
          >
            Mark In Payroll
          </button>
        );
      }
      if (row.payrollStatus === 'In Payroll') {
        return (
          <button
            onClick={() => updatePayrollStatus(row, 'Paid')}
            className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700"
          >
            Mark Paid
          </button>
        );
      }
      return <span className="text-green-700 text-xs font-medium">Paid</span>;
    }},
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Payroll Queue</h1>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared timesheets are unreachable right now. Changes here will sync when they come back.
        </p>
      )}

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Status:</label>
        {PAYROLL_STATUS_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
              statusFilter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
        <button
          onClick={createInvoices}
          disabled={billableCount === 0}
          className="ml-auto bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
        >
          Create invoices ({billableCount} ready)
        </button>
      </div>

      {rows.length === 0 ? (
        <Empty
          title={`No ${statusFilter.toLowerCase()} timesheets`}
          hint={statusFilter === 'Ready' ? 'Approved timesheets that pass compliance checks will appear here.' : `No timesheets with "${statusFilter}" status.`}
        />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={15} />
      )}
    </div>
  );
}
