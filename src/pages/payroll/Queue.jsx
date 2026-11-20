import React, { useState, useMemo, useEffect } from 'react';
import {
  getTimesheets, setTimesheets, getAssignmentById, getCandidateById, getJobById,
  createInvoicesFromPaidTimesheets, getUnbillablePaidTimesheets,
  now
} from '@/utils/storage';
import { fetchTimesheets, reconcileTimesheets, syncTimesheetToSupabase, syncInvoiceToSupabase, isRlsDenied } from '@/lib/pipeline';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty, AccessDenied } from '@/components/ui';
import { useToasts } from '@/components/ui/ToastProvider.jsx';
import { useCapabilities } from '@/lib/capabilities';

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
  // Per-timesheet invoice selection: demo timesheet ids the user checked
  // for billing. Nothing is checked by default — invoicing is deliberate,
  // so a bulk click can no longer sweep in a Paid timesheet nobody picked.
  const [selected, setSelected] = useState(() => new Set());
  // Slice 7: an RLS denial is not an outage — show the denied state and
  // never fall back to the unscoped demo store.
  const [denied, setDenied] = useState(false);
  const { addToast } = useToasts();
  // Slice 7: creating invoices from payroll is an invoices.manage action
  // (backoffice + admin by default). The route is backoffice-only, so this
  // only matters if the route gate is ever widened.
  const { hasCapability } = useCapabilities();

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
    // Await the sync before advancing the visible row — the row's status
    // is the payroll state of record, and a failed sync must leave the
    // row where it was so the flip can be retried (the demo write above
    // already succeeded, and the flip is idempotent on the same row; a
    // later reconcile re-syncs it). Same pattern as the shared-save fix
    // in timekeeping/Form.jsx: displayed status only advances after the
    // sync confirms.
    const syncResult = await syncTimesheetToSupabase(updated);
    if (syncResult === 'failed') {
      addToast({ type: 'error', message: `Timesheet saved locally as "${newStatus}", but it could not be saved to the shared store. The row still shows the previous status — try again.` });
      return;
    }
    if (syncResult === 'skipped') {
      addToast({ type: 'error', message: `Timesheet saved locally as "${newStatus}". It will sync to the shared store once the assignment record syncs — the row still shows the previous status.` });
      return;
    }
    // Update the visible row in place — do not refetch, the sync may not
    // have landed yet and a stale fetch would overwrite the new status.
    setData((prev) => prev.map((r) => (r.id === row.id ? { ...r, payrollStatus: newStatus } : r)));
    addToast({ type: 'success', message: `Timesheet marked as "${newStatus}".` });
  };

  const billableCount = data.filter(t => t.payrollStatus === 'Paid' && !t.invoiceId && (t.totalHours || 0) > 0).length;

  // A row is selectable for invoicing when it is a Paid, uninvoiced
  // timesheet with hours and a local demo row to bill from.
  const isBillable = (row) => row.payrollStatus === 'Paid' && !row.invoiceId && (row.totalHours || 0) > 0 && !!row.demoTimesheetId;
  const billableIds = () => data.filter(isBillable).map((t) => t.demoTimesheetId);
  const toggleSelect = (demoId) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(demoId)) next.delete(demoId); else next.add(demoId);
    return next;
  });
  const selectAllBillable = () => setSelected(new Set(billableIds()));
  const clearSelection = () => setSelected(new Set());

  // Slice 1 (ATS/CRM milestone): paid timesheets that cannot be invoiced
  // because no bill rate resolves — shown before the user generates a draft.
  const missingRates = useMemo(() => getUnbillablePaidTimesheets(), [data]);

  const createInvoices = async () => {
    const created = createInvoicesFromPaidTimesheets([...selected]);
    const missing = created.missingRates || [];
    if (created.length === 0) {
      if (missing.length > 0) {
        addToast({ type: 'info', message: `No invoices created — ${missing.length} paid timesheet${missing.length > 1 ? 's have' : ' has'} no bill rate: ${missing.map((m) => m.label).join('; ')}` });
      } else {
        addToast({ type: 'info', message: 'No paid timesheets ready to invoice.' });
      }
      return;
    }
    // Slice 5: sync the new invoices up FIRST, then the timesheets they
    // stamped. The timesheet sync resolves the invoice's Supabase id by
    // lookup, so it must wait until the invoice rows exist — syncing both
    // concurrently raced and the stamps landed as NULL (verified live
    // 2026-11-12: INV-2026-009 existed but both timesheets had
    // invoice_id NULL until a later reconcile fixed them).
    const results = await Promise.all(created.map((inv) => syncInvoiceToSupabase(inv)));
    // Only invoices whose sync confirmed ('created' | 'demo' |
    // 'supabase') count as shared. A 'failed' or 'skipped' invoice is
    // local-only: its timesheets must not sync yet either, or their
    // invoice stamp would land as NULL (the invoice row does not exist
    // in Supabase for the lookup to resolve).
    const syncedInvoices = created.filter((_, i) => results[i] !== 'failed' && results[i] !== 'skipped');
    const failedInvoices = created.filter((_, i) => results[i] === 'failed' || results[i] === 'skipped');
    const syncedIds = new Set(syncedInvoices.map((inv) => inv.id));
    getTimesheets()
      .filter((t) => t.invoiceId && syncedIds.has(t.invoiceId))
      .forEach((t) => syncTimesheetToSupabase(t));
    setData(getTimesheets().map(mapDemoRow));
    setSelected(new Set());
    if (syncedInvoices.length > 0) {
      const summary = syncedInvoices.map(i => `${i.invoiceNumber} (${i.clientName}, $${i.total.toFixed(2)})`).join(', ');
      addToast({ type: 'success', message: `Created ${syncedInvoices.length} invoice${syncedInvoices.length > 1 ? 's' : ''}: ${summary}` });
    }
    if (failedInvoices.length > 0) {
      addToast({ type: 'error', message: `${failedInvoices.length} invoice${failedInvoices.length > 1 ? 's' : ''} saved locally but not to the shared store: ${failedInvoices.map((i) => i.invoiceNumber).join(', ')}` });
    }
    if (missing.length > 0) {
      addToast({ type: 'info', message: `Skipped ${missing.length} paid timesheet${missing.length > 1 ? 's' : ''} with no bill rate: ${missing.map((m) => m.label).join('; ')}` });
    }
  };

  const rows = useMemo(() => {
    return data
      .filter(t => t.payrollStatus === statusFilter)
      .sort((a, b) => (b.weekEnding || '').localeCompare(a.weekEnding || ''));
  }, [data, statusFilter]);

  const columns = [
    { key: 'bill', header: 'Bill', render: (_, row) => {
      if (!isBillable(row)) return <span className="text-gray-300">-</span>;
      return (
        <input
          type="checkbox"
          checked={selected.has(row.demoTimesheetId)}
          onChange={() => toggleSelect(row.demoTimesheetId)}
          aria-label={`Select ${row.candidate} timesheet for invoicing`}
        />
      );
    }},
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

  if (denied) {
    return <AccessDenied />;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Payroll Queue</h1>

      <p className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded px-3 py-2 mb-4">
        Simulated payroll — no real money moves. Marking a timesheet Paid only changes its status; invoices created here are drafts.
      </p>

      {/* The box is a stable function of current state: it lists the
          unbillable Paid timesheets when any are missing a rate, and
          shows an all-clear line whenever Paid timesheets are waiting
          to be invoiced but none is missing a rate — so it no longer
          appears in one state and vanishes in the other (the only Paid
          uninvoiced timesheet in the demo, ts-005, has a $95 bill rate,
          so the box used to disappear entirely after a reload even
          though billable rows were still waiting). It renders nothing
          only when there are no Paid uninvoiced timesheets at all. */}
      {missingRates.length > 0 ? (
        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          <p className="font-medium mb-1">Missing bill rate — {missingRates.length} paid timesheet{missingRates.length > 1 ? 's' : ''} cannot be invoiced yet:</p>
          <ul className="list-disc list-inside">
            {missingRates.map((m) => (
              <li key={m.timesheetId}>{m.label} ({m.reason})</li>
            ))}
          </ul>
        </div>
      ) : billableCount > 0 ? (
        <p className="text-xs text-green-800 bg-green-50 border border-green-200 rounded px-3 py-2 mb-4">
          No timesheets are missing a bill rate. All selected timesheets can be invoiced.
        </p>
      ) : null}

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
        {billableCount > 0 && (
          <>
            <button onClick={selectAllBillable} className="text-xs text-blue-600 hover:underline">Select all</button>
            <button onClick={clearSelection} className="text-xs text-blue-600 hover:underline">Clear</button>
          </>
        )}
        <button
          onClick={createInvoices}
          disabled={selected.size === 0 || !hasCapability('invoices.manage')}
          title={!hasCapability('invoices.manage') ? 'You do not have permission to create invoices.' : selected.size === 0 ? 'Select paid timesheets to invoice.' : ''}
          className="ml-auto bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500"
        >
          Create invoices ({selected.size} selected)
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
