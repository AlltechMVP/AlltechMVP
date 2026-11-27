import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, addWeeks, subWeeks, addMonths, subMonths, isToday, isSameMonth } from 'date-fns';
import {
  getAssignments, getCandidateById, getJobById, getClients,
} from '@/utils/storage';
import { fetchSettledOrLocal, reconcileAssignments, isRlsDenied } from '@/lib/pipeline';
import { assignmentsForDay, monthGridDays, weekDays } from '@/utils/schedule';
import { Empty, AccessDenied } from '@/components/ui';

// Scheduler reads LIVE assignments — Supabase first, demo-store fallback
// when Supabase is unreachable (the same settled pattern as the payroll
// pages). The old mock events are gone: no fake people, no fake dates, no
// localStorage-only data anywhere on this page. An Active assignment is
// shown on every day it covers, from its start date through its end date
// (ongoing when there is no end date), so the live week shows the people
// actually working. "Add Job" goes to the real assignment form; the old
// localStorage-only add/edit modal is gone — assignments are created and
// edited where assignments live.
function toScheduleRow(a) {
  // Mapped (shared) rows already carry names; demo-store rows need the
  // local lookups. Both shapes normalize to one display row.
  if (a.candidateName || a.jobTitle) {
    const client = (a.clientName && a.clientName !== '—') ? a.clientName : '';
    return {
      id: String(a.id),
      detailId: a.legacyId || String(a.id),
      person: a.candidateName || '—',
      job: a.jobTitle || '—',
      client,
      startDate: a.startDate || null,
      endDate: a.endDate || null,
      status: a.status || '—',
    };
  }
  const candidate = a.candidateId ? getCandidateById(a.candidateId) : null;
  const job = a.jobId ? getJobById(a.jobId) : null;
  const client = job ? getClients().find((c) => c.id === job.clientId) : null;
  return {
    id: String(a.id),
    detailId: String(a.id),
    person: candidate?.name || '—',
    job: job?.title || '—',
    client: client?.name || '',
    startDate: a.startDate || null,
    endDate: a.endDate || null,
    status: a.status || '—',
  };
}

export default function Scheduler() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [denied, setDenied] = useState(false);
  const [viewMode, setViewMode] = useState('week');
  const [cursor, setCursor] = useState(() => new Date());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // One settled render: reconcile first (pushes this browser's demo
        // rows up, pulls shared rows down), then paint once — the same
        // pattern as PayrollView, so the page never flashes two row sets.
        const { rows: fresh, usingFallback: fb } = await fetchSettledOrLocal(reconcileAssignments, getAssignments);
        if (!mounted) return;
        setRows(fresh.map(toScheduleRow));
        setUsingFallback(fb);
      } catch (err) {
        if (isRlsDenied(err)) { if (mounted) setDenied(true); return; }
        if (mounted) { setRows(getAssignments().map(toScheduleRow)); setUsingFallback(true); }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (denied) {
    return <AccessDenied />;
  }

  const days = viewMode === 'week' ? weekDays(cursor) : monthGridDays(cursor);
  const step = (dir) => {
    if (viewMode === 'week') setCursor((c) => (dir > 0 ? addWeeks(c, 1) : subWeeks(c, 1)));
    else setCursor((c) => (dir > 0 ? addMonths(c, 1) : subMonths(c, 1)));
  };
  const title = viewMode === 'week'
    ? `Week of ${format(days[0], 'MMM d, yyyy')}`
    : format(cursor, 'MMMM yyyy');
  const activeCount = rows.filter((r) => r.status === 'Active').length;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Scheduler</h1>
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-1">
            <button
              onClick={() => step(-1)}
              className="px-2 py-1 border rounded bg-white hover:bg-gray-50"
              aria-label="Previous period"
            >
              ‹
            </button>
            <button
              onClick={() => setCursor(new Date())}
              className="px-3 py-1 border rounded bg-white hover:bg-gray-50"
            >
              Today
            </button>
            <button
              onClick={() => step(1)}
              className="px-2 py-1 border rounded bg-white hover:bg-gray-50"
              aria-label="Next period"
            >
              ›
            </button>
          </div>
          <div className="flex rounded-lg border border-gray-200 p-1 bg-white">
            <button
              className={`px-3 py-1 rounded ${viewMode === 'week' ? 'bg-blue-500 text-white' : ''}`}
              onClick={() => setViewMode('week')}
            >
              Week View
            </button>
            <button
              className={`px-3 py-1 rounded ${viewMode === 'month' ? 'bg-blue-500 text-white' : ''}`}
              onClick={() => setViewMode('month')}
            >
              Month View
            </button>
          </div>
          <Link
            to="/assignments/new"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Job
          </Link>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {title} · {activeCount} active assignment{activeCount === 1 ? '' : 's'}
      </p>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared assignments are unreachable right now.
        </p>
      )}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading schedule…</p>
      ) : activeCount === 0 ? (
        <Empty title="No active assignments" hint="Active assignments appear here on the days they cover, from their start date." />
      ) : (
        <>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-sm font-medium">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 mt-2">
            {days.map((day, idx) => {
              const iso = format(day, 'yyyy-MM-dd');
              const todays = assignmentsForDay(rows, iso);
              const inMonth = viewMode === 'week' || isSameMonth(day, cursor);
              return (
                <div
                  key={idx}
                  className={`bg-white border rounded-lg p-2 min-h-[120px] ${
                    isToday(day) ? 'border-blue-500' : ''
                  } ${inMonth ? '' : 'opacity-40'}`}
                >
                  <div className="text-right text-xs font-bold mb-2">
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {todays.map((a) => (
                      <Link
                        key={a.id}
                        to={`/assignments/${a.detailId}`}
                        className="block bg-blue-50 p-2 rounded text-xs border border-blue-100 hover:bg-blue-100"
                      >
                        <div className="font-medium">{a.person}</div>
                        <div className="text-gray-500">{a.job}{a.client ? ` · ${a.client}` : ''}</div>
                        {a.startDate === iso && (
                          <div className="text-gray-400">Starts today</div>
                        )}
                      </Link>
                    ))}
                    {todays.length === 0 && (
                      <div className="text-gray-300 text-xs">No jobs</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {viewMode === 'month' && (
            <p className="text-xs text-gray-500 mt-3">
              Assignments span every day they cover — an assignment with no end date keeps showing until it ends.
            </p>
          )}
        </>
      )}
    </div>
  );
}
