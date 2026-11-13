import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getCandidates, getJobById, normalizeStatus,
  getAllowedTransitions, changeCandidateStatus, getCandidateById,
  findCandidateByEmail, createCandidate, submitCandidateToJob,
} from '@/utils/storage';
import {
  fetchJobs, fetchApplications, fetchPersons, syncCandidateToSupabase, reconcilePipeline, isRlsDenied,
} from '@/lib/pipeline';
import { useAuth } from '@/context/AuthContext.jsx';
import { useCapabilities } from '@/lib/capabilities';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty, AccessDenied } from '@/components/ui';
import { useToasts } from '@/components/ui/ToastProvider.jsx';
import QuickAddCandidate from '@/components/QuickAddCandidate.jsx';

const STATUS_COLORS = {
  'Applied': 'bg-gray-100 text-gray-800',
  'Reviewed': 'bg-blue-100 text-blue-800',
  'Submitted': 'bg-indigo-100 text-indigo-800',
  'Interview': 'bg-purple-100 text-purple-800',
  'Hired': 'bg-emerald-100 text-emerald-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Active Assignment': 'bg-green-100 text-green-800',
  'Assignment Ended': 'bg-orange-100 text-orange-800',
};

const FILTER_OPTIONS = ['All', 'Applied', 'Reviewed', 'Submitted', 'Interview', 'Hired', 'Rejected'];

// Slice 1 (thin): per-job candidates read from Supabase (shared) with a
// demo-store fallback. Writes still go to the demo row, then sync.
function attachDemoTwins(apps) {
  const demoRows = getCandidates();
  return apps.map((a) => {
    const twin = demoRows.find((d) => String(d.supabaseApplicationId) === String(a.id))
      || demoRows.find((d) => (d.email || '').trim().toLowerCase() === (a.email || '').trim().toLowerCase()
        && String(d.submittedJobId) === String(a.legacyJobId));
    return { ...a, demoCandidateId: twin ? twin.id : null };
  });
}

export default function JobCandidates() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const { session } = useAuth();
  // Slice 7: Quick Add Candidate is a candidates.quickadd action (all
  // internal staff by default). This route is auth-only, so the button is
  // hidden from client/candidate users.
  const { hasCapability } = useCapabilities();
  const [statusFilter, setStatusFilter] = useState('All');
  const [data, setData] = useState([]);
  const [job, setJob] = useState(null);
  // Slice 7: an RLS denial is not an outage — show the denied state and
  // never fall back to the unscoped demo store.
  const [denied, setDenied] = useState(false);
  // ATS/CRM milestone (slice 6): submit an EXISTING candidate to this
  // order, or Quick Add a new one with this order pre-selected.
  const [talent, setTalent] = useState([]);
  const [talentQuery, setTalentQuery] = useState('');
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const userEmail = session?.user?.email || '';

  const loadTalent = async () => {
    try {
      const people = await fetchPersons();
      setTalent(people.map((p) => ({ name: p.name, email: p.email || '', phone: p.phone || '' })));
    } catch (err) {
      if (isRlsDenied(err)) { setDenied(true); return; }
      const byEmail = new Map();
      for (const c of getCandidates()) {
        const email = (c.email || '').trim().toLowerCase();
        if (email && !byEmail.has(email)) byEmail.set(email, { name: c.name, email: c.email, phone: c.phone || '' });
      }
      setTalent([...byEmail.values()]);
    }
  };

  const loadSupabase = async () => {
    const jobs = await fetchJobs();
    const found = jobs.find((j) => String(j.id) === String(jobId));
    setJob(found || null);
    const apps = await fetchApplications({ jobId: Number(jobId) });
    setData(attachDemoTwins(apps));
  };

  const load = async () => {
    try {
      await loadSupabase();
    } catch (err) {
      if (isRlsDenied(err)) { setDenied(true); return; }
      try {
        // The shared fetch failed: try the reconcile (it re-syncs and
        // re-fetches) before falling back to local demo data.
        await reconcilePipeline();
        await loadSupabase();
      } catch (err2) {
        if (isRlsDenied(err2)) { setDenied(true); return; }
        setJob(getJobById(jobId) || null);
        setData(getCandidates()
          .filter(c => String(c.submittedJobId) === String(jobId) || String(c.currentJobId) === String(jobId))
          .map((c) => ({
            id: c.id,
            demoCandidateId: c.id,
            name: c.name,
            email: c.email || '-',
            status: normalizeStatus(c.status),
            lastActionAt: c.lastActionAt || null,
          })));
      }
    }
  };

  useEffect(() => {
    load();
    loadTalent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleSubmitExisting = async (person) => {
    // Ensure a demo row exists for this person (create the record if the
    // person only exists in the shared store), then submit to this order.
    let demo = findCandidateByEmail(person.email);
    if (!demo) {
      const created = createCandidate({ name: person.name, email: person.email, phone: person.phone });
      if (!created) {
        addToast({ type: 'error', message: 'Could not find the local record for this candidate.' });
        return;
      }
      demo = created.candidate;
    }
    const result = submitCandidateToJob(demo.id, jobId, userEmail || 'recruiter');
    if (!result) {
      addToast({ type: 'error', message: 'Could not submit the candidate. Please try again.' });
      return;
    }
    if (result.alreadySubmitted) {
      addToast({ message: `${person.name} is already on this order.`, kind: 'success' });
      return;
    }
    syncCandidateToSupabase(result.candidate).catch(() => {});
    addToast({ message: `${person.name} submitted to ${job?.title || 'this order'} as Applied.`, kind: 'success' });
    await load();
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
      await load();
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
        status,
        lastAction: c.lastActionAt ? new Date(c.lastActionAt).toLocaleDateString() : '-',
        allowed: getAllowedTransitions(status),
      };
    });
  }, [data, statusFilter]);

  const columns = [
    { key: 'name', header: 'Candidate', render: (v, row) => (
      <Link to={`/candidates/${row.id}`} className="text-blue-600 hover:underline font-medium">{v}</Link>
    )},
    { key: 'email', header: 'Email' },
    { key: 'status', header: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v] || 'bg-gray-100'}`}>{v}</span>
    )},
    { key: 'lastAction', header: 'Last Action' },
    { key: 'id', header: 'Actions', render: (_, row) => {
      const quickActions = row.allowed.filter(s => ['Reviewed', 'Submitted', 'Interview', 'Hired', 'Rejected'].includes(s));
      if (quickActions.length === 0) {
        return <span className="text-xs text-gray-400 italic">No actions</span>;
      }
      const btnCls = { Reviewed: 'bg-blue-600', Submitted: 'bg-indigo-600', Interview: 'bg-purple-600', Hired: 'bg-emerald-600', Rejected: 'bg-red-600' };
      const btnLabel = { Reviewed: 'Review', Submitted: 'Submit', Interview: 'Interview', Hired: 'Hire', Rejected: 'Reject' };
      return (
        <div className="flex gap-1 flex-wrap">
          {quickActions.map(s => {
            const isReopen = s === 'Reviewed' && row.status === 'Rejected';
            return (
              <button
                key={s}
                onClick={() => handleAction(row.id, s)}
                className={`text-white px-2 py-1 rounded text-xs font-medium ${isReopen ? 'bg-yellow-500' : (btnCls[s] || 'bg-gray-600')}`}
              >
                {isReopen ? 'Reopen' : btnLabel[s]}
              </button>
            );
          })}
        </div>
      );
    }},
  ];

  if (denied) {
    return <AccessDenied />;
  }

  if (!job) {
    return <div className="p-4 text-gray-500">Job not found.</div>;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <button onClick={() => navigate('/jobs')} className="text-blue-600 hover:underline text-sm mb-4 inline-block">&larr; Back to Jobs</button>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">{job.title}</h1>
          <p className="text-sm text-gray-600">{job.client_name} | {job.location}</p>
        </div>
        <span className="text-sm text-gray-500">{rows.length} candidate{rows.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {FILTER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {hasCapability('candidates.quickadd') && (
          <button
            onClick={() => setQuickAddOpen(true)}
            className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Quick Add Candidate
          </button>
        )}
      </div>

      {/* Submit an existing candidate to this order */}
      <div className="mb-6 border rounded-xl bg-white p-4">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Submit an existing candidate to this order</h2>
        <p className="text-xs text-gray-500 mb-3">Search the talent pool — submitting creates a recruiting record for this order only; the candidate&apos;s stage on other orders is untouched.</p>
        <input
          type="text"
          placeholder="Search by name, email, or phone"
          value={talentQuery}
          onChange={(e) => setTalentQuery(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm w-80 mb-3"
        />
        {(() => {
          const q = talentQuery.trim().toLowerCase();
          const onOrder = new Set(data.map((d) => (d.email || '').trim().toLowerCase()));
          const matches = talent
            .filter((p) => !onOrder.has((p.email || '').trim().toLowerCase()))
            .filter((p) => !q
              || (p.name || '').toLowerCase().includes(q)
              || (p.email || '').toLowerCase().includes(q)
              || (p.phone || '').toLowerCase().includes(q));
          if (talent.length === 0) return <p className="text-sm text-gray-500">No candidates in the talent pool yet.</p>;
          if (matches.length === 0) return <p className="text-sm text-gray-500">{q ? 'No matching candidates outside this order.' : 'Everyone in the talent pool is already on this order.'}</p>;
          return (
            <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
              {matches.slice(0, 10).map((p) => (
                <li key={p.email} className="py-2 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="font-medium text-sm text-gray-900">{p.name}</span>
                    <span className="text-xs text-gray-500 ml-2">{p.email}{p.phone ? ` · ${p.phone}` : ''}</span>
                  </div>
                  <button
                    onClick={() => handleSubmitExisting(p)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs font-medium shrink-0"
                  >
                    Submit to this order
                  </button>
                </li>
              ))}
            </ul>
          );
        })()}
      </div>

      {rows.length === 0 ? (
        <Empty title="No candidates for this job" hint="Candidates submitted to this job will appear here." />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={10} />
      )}

      <QuickAddCandidate
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        jobId={jobId}
        jobTitle={job?.title}
        onCreated={() => load()}
      />
    </div>
  );
}
