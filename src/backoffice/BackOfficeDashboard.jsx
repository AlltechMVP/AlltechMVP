import React, { useState, useEffect } from 'react';
import {
  getTimesheets, getInvoices, getAssignmentById, getCandidateById, getJobById,
} from '@/utils/storage';
import { fetchSettledOrLocal, reconcileTimesheets, reconcileInvoices, isRlsDenied } from '@/lib/pipeline';
import { AccessDenied } from '@/components/ui';

// Back Office Dashboard reads live data — Supabase first, demo-store
// fallback when Supabase is unreachable (same pattern as the payroll
// queue and the invoices list). The old mock files are gone from this
// page: Payroll Total is sum(hours x bill rate), resolved the same way
// the queue resolves it, and Invoice Total is the sum of live invoice
// totals. The "Emails This Week" card had no live source, so it was
// removed rather than faked.
function resolveBillRate(t) {
  const assignment = getAssignmentById(t.assignmentId);
  const job = assignment ? getJobById(assignment.jobId) : null;
  return assignment?.billRate || job?.rate || 0;
}

function timesheetName(t) {
  if (t.candidateName) return t.candidateName;
  const assignment = getAssignmentById(t.assignmentId);
  const candidate = assignment ? getCandidateById(assignment.candidateId) : null;
  return candidate?.name || '—';
}

function invoiceTotal(inv) {
  return inv.total ?? inv.totalAmount ?? 0;
}

export default function BackOfficeDashboard() {
  const [timesheets, setTimesheets] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // One settled render: reconcile first, then paint once. Rendering
        // the raw fetch first and the reconcile second flashed two
        // different totals in sequence — the same first-load flicker the
        // payroll summary had.
        //
        // The shared reads must not silently paint $0: a fetch that goes
        // out before the auth session settles is filtered by RLS to []
        // with HTTP 200 and no error. fetchSettledOrLocal retries once
        // after the session settles and otherwise falls back to the demo
        // store instead of painting empty totals.
        const [tsRes, invRes] = await Promise.all([
          fetchSettledOrLocal(reconcileTimesheets, getTimesheets),
          fetchSettledOrLocal(reconcileInvoices, getInvoices),
        ]);
        if (!mounted) return;
        setTimesheets(tsRes.rows);
        setInvoices(invRes.rows);
        setUsingFallback(tsRes.usingFallback || invRes.usingFallback);
        setLoading(false);
      } catch (err) {
        if (isRlsDenied(err)) { if (mounted) { setDenied(true); setLoading(false); } return; }
        // Shared fetch failed: fall back to the local demo store.
        if (mounted) {
          setTimesheets(getTimesheets());
          setInvoices(getInvoices());
          setUsingFallback(true);
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (denied) {
    return <AccessDenied />;
  }

  const metrics = {
    totalHours: timesheets.reduce((sum, ts) => sum + (ts.totalHours || 0), 0),
    payrollTotal: timesheets.reduce((sum, ts) => sum + ((ts.totalHours || 0) * resolveBillRate(ts)), 0),
    invoiceTotal: invoices.reduce((sum, inv) => sum + invoiceTotal(inv), 0),
  };

  const recentTimesheets = [...timesheets]
    .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''))
      || String(a.id).localeCompare(String(b.id)))
    .slice(0, 5);
  const recentInvoices = [...invoices]
    .sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''))
      || String(a.id).localeCompare(String(b.id)))
    .slice(0, 5);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Back Office Dashboard</h2>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared timesheets and invoices are unreachable right now.
        </p>
      )}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-blue-100 rounded">
              <div className="text-lg font-semibold">Total Hours</div>
              <div className="text-3xl">{metrics.totalHours}</div>
            </div>

            <div className="p-4 bg-green-100 rounded">
              <div className="text-lg font-semibold">Payroll Total</div>
              <div className="text-3xl">${metrics.payrollTotal.toFixed(2)}</div>
            </div>

            <div className="p-4 bg-yellow-100 rounded">
              <div className="text-lg font-semibold">Invoice Total</div>
              <div className="text-3xl">${metrics.invoiceTotal.toFixed(2)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Recent Timesheets</h3>
              <div className="space-y-2">
                {recentTimesheets.length === 0 ? (
                  <p className="text-gray-500 text-sm">No timesheets yet.</p>
                ) : recentTimesheets.map(ts => (
                  <div key={ts.id} className="p-2 border rounded">
                    {timesheetName(ts)} - {ts.totalHours || 0} hours
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Recent Invoices</h3>
              <div className="space-y-2">
                {recentInvoices.length === 0 ? (
                  <p className="text-gray-500 text-sm">No invoices yet.</p>
                ) : recentInvoices.map(inv => (
                  <div key={inv.id} className="p-2 border rounded">
                    {inv.clientName || '—'} - ${invoiceTotal(inv).toFixed(2)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
