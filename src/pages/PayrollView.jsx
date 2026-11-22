import React, { useState, useEffect } from 'react';
import {
  getTimesheets, getAssignmentById, getCandidateById, getJobById,
} from '@/utils/storage';
import { fetchTimesheets, reconcileTimesheets, isRlsDenied } from '@/lib/pipeline';
import { Empty, AccessDenied } from '@/components/ui';

// Payroll Summary reads live timesheets — Supabase first, demo-store
// fallback when Supabase is unreachable (same pattern as the payroll
// queue). The old hardcoded April rows are gone: the summary must agree
// with the queue, so the amount is hours x the timesheet's bill rate,
// resolved the same way the queue resolves it (assignment.billRate,
// falling back to the job's rate).
function resolveBillRate(t) {
  const assignment = getAssignmentById(t.assignmentId);
  const job = assignment ? getJobById(assignment.jobId) : null;
  return assignment?.billRate || job?.rate || 0;
}

function toRow(t) {
  const assignment = getAssignmentById(t.assignmentId);
  const candidate = assignment ? getCandidateById(assignment.candidateId) : null;
  const job = assignment ? getJobById(assignment.jobId) : null;
  const hours = t.totalHours ?? 0;
  const rate = resolveBillRate(t);
  return {
    id: t.id,
    employee: t.candidateName || candidate?.name || '—',
    job: t.jobTitle || job?.title || '—',
    week: t.weekEnding || '—',
    hours,
    rate,
    total: hours * rate,
    status: t.payrollStatus || t.status || '—',
  };
}

function PayrollView() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const fetched = await fetchTimesheets();
        if (!mounted) return;
        setRows(fetched.map(toRow));
        setUsingFallback(false);
        setLoading(false);
        reconcileTimesheets()
          .then((fresh) => { if (mounted) setRows(fresh.map(toRow)); })
          .catch(() => {});
      } catch (err) {
        if (isRlsDenied(err)) { if (mounted) { setDenied(true); setLoading(false); } return; }
        try {
          const fresh = await reconcileTimesheets();
          if (!mounted) return;
          setRows(fresh.map(toRow));
          setUsingFallback(false);
        } catch (err2) {
          if (isRlsDenied(err2)) { if (mounted) setDenied(true); }
          else if (mounted) { setRows(getTimesheets().map(toRow)); setUsingFallback(true); }
        } finally {
          if (mounted) setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (denied) {
    return <AccessDenied />;
  }

  // Newest week first; the queue shows the same rows, so the two pages agree.
  const sorted = [...rows].sort((a, b) => String(b.week).localeCompare(String(a.week)));
  const totalHours = sorted.reduce((s, r) => s + (r.hours || 0), 0);
  const totalAmount = sorted.reduce((s, r) => s + (r.total || 0), 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payroll Summary</h1>
      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared timesheets are unreachable right now.
        </p>
      )}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading payroll…</p>
      ) : sorted.length === 0 ? (
        <Empty title="No timesheets yet" hint="Approved timesheets will appear here once time is submitted." />
      ) : (
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Employee</th>
              <th className="p-2 border">Job</th>
              <th className="p-2 border">Week</th>
              <th className="p-2 border">Hours</th>
              <th className="p-2 border">Bill Rate</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.id}>
                <td className="p-2 border">{row.employee}</td>
                <td className="p-2 border">{row.job}</td>
                <td className="p-2 border">{row.week}</td>
                <td className="p-2 border">{row.hours}</td>
                <td className="p-2 border">${row.rate.toFixed(2)}</td>
                <td className="p-2 border">${row.total.toFixed(2)}</td>
                <td className="p-2 border">{row.status}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 font-semibold">
              <td className="p-2 border" colSpan={3}>Total</td>
              <td className="p-2 border">{totalHours}</td>
              <td className="p-2 border"></td>
              <td className="p-2 border">${totalAmount.toFixed(2)}</td>
              <td className="p-2 border"></td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
}

export default PayrollView;
