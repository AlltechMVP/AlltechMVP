import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  getCandidates, findCandidateByEmail, createCandidate, submitCandidateToJob,
  normalizeStatus, getRecruitingStage, getJobs,
} from '@/utils/storage';
import {
  fetchPersons, fetchApplications, fetchJobs, syncCandidateToSupabase,
  reconcilePipeline, isRlsDenied,
} from '@/lib/pipeline';
import { useAuth } from '@/context/AuthContext.jsx';
import { useToasts } from '@/components/ui/ToastProvider.jsx';
import { Empty, AccessDenied } from '@/components/ui';
import DataTable from '@/components/table/DataTable.jsx';
import QuickAddCandidate from '@/components/QuickAddCandidate.jsx';

const STATUS_COLORS = {
  'Applied': 'bg-gray-100 text-gray-800',
  'Reviewed': 'bg-blue-100 text-blue-800',
  'Submitted': 'bg-indigo-100 text-indigo-800',
  'Interview': 'bg-purple-100 text-purple-800',
  'Hired': 'bg-emerald-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Assigned': 'bg-cyan-100 text-cyan-800',
  'Active Assignment': 'bg-green-100 text-green-800',
  'Assignment Ended': 'bg-orange-100 text-orange-800',
};

// ATS/CRM milestone (slice 6): search the existing talent pool by name and
// contact info (email/phone). Candidate records have ONLY name/email/phone/
// resume_url/status — there are no skills, location, or availability
// columns, so those can't be searched yet (backlog, noted on the page).
// One row per PERSON (deduped by email); each row lists the orders the
// person is on with the stage per order, and offers "Submit to order".

function dedupePersons(rows) {
  const byEmail = new Map();
  for (const r of rows) {
    const email = (r.email || '').trim().toLowerCase();
    if (!email) continue;
    if (!byEmail.has(email)) byEmail.set(email, r);
  }
  return [...byEmail.values()];
}

function demoPersons() {
  return dedupePersons(getCandidates()).map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email || '',
    phone: c.phone || '',
    status: normalizeStatus(c.status),
    demoCandidateId: c.id,
  }));
}

function demoApplications() {
  return getCandidates()
    .filter((c) => c.submittedJobId)
    .map((c) => ({
      id: c.id,
      email: c.email || '',
      jobId: c.submittedJobId,
      jobTitle: (getJobs().find((j) => String(j.id) === String(c.submittedJobId)) || {}).title || String(c.submittedJobId),
      status: normalizeStatus(c.status),
      history: c.statusHistory || [],
    }));
}

export default function TalentSearch() {
  const { session } = useAuth();
  const { addToast } = useToasts();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [persons, setPersons] = useState([]);
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [submitJobId, setSubmitJobId] = useState({});
  const [usingFallback, setUsingFallback] = useState(false);
  const [denied, setDenied] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const userEmail = session?.user?.email || '';

  const load = async () => {
    try {
      const [people, apps] = await Promise.all([fetchPersons(), fetchApplications()]);
      setPersons(people.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email || '',
        phone: p.phone || '',
        status: normalizeStatus(p.status),
        demoCandidateId: (findCandidateByEmail(p.email) || {}).id || null,
      })));
      setApplications(apps.map((a) => ({
        id: a.id,
        email: a.email || '',
        jobId: a.jobId,
        jobTitle: a.jobTitle,
        status: normalizeStatus(a.status),
        legacyJobId: a.legacyJobId,
        history: a.history || [],
      })));
      setUsingFallback(false);
    } catch (err) {
      if (isRlsDenied(err)) { setDenied(true); return; }
      try {
        await reconcilePipeline();
        const [people, apps] = await Promise.all([fetchPersons(), fetchApplications()]);
        setPersons(people.map((p) => ({
          id: p.id, name: p.name, email: p.email || '', phone: p.phone || '',
          status: normalizeStatus(p.status),
          demoCandidateId: (findCandidateByEmail(p.email) || {}).id || null,
        })));
        setApplications(apps.map((a) => ({
          id: a.id, email: a.email || '', jobId: a.jobId, jobTitle: a.jobTitle,
          status: normalizeStatus(a.status), legacyJobId: a.legacyJobId,
          history: a.history || [],
        })));
        setUsingFallback(false);
      } catch (err2) {
        if (isRlsDenied(err2)) { setDenied(true); return; }
        setPersons(demoPersons());
        setApplications(demoApplications());
        setUsingFallback(true);
      }
    }
    try {
      const data = await fetchJobs();
      setJobs(data.filter((j) => (j.status || 'Open') === 'Open'));
    } catch {
      setJobs(getJobs().filter((j) => (j.status || 'Open') === 'Open'));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitToOrder = async (person) => {
    const jobId = submitJobId[person.email];
    if (!jobId) {
      addToast({ type: 'error', message: 'Pick an order first.' });
      return;
    }
    // Ensure a demo row exists for this person (create the record if the
    // person only exists in the shared store), then submit to the order.
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
      addToast({ message: `${person.name} is already on that order.`, kind: 'success' });
      return;
    }
    await syncCandidateToSupabase(result.candidate);
    const job = jobs.find((j) => String(j.id) === String(jobId));
    addToast({ message: `${person.name} submitted to ${job?.title || 'the order'} as Applied.`, kind: 'success' });
    await load();
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let items = persons;
    if (q) {
      items = items.filter((p) =>
        (p.name || '').toLowerCase().includes(q)
        || (p.email || '').toLowerCase().includes(q)
        || (p.phone || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'All') {
      // Match the displayed stage too: a placed candidate shows Hired on
      // their order row alongside Active Assignment, so the Hired filter
      // must find them.
      items = items.filter((p) => {
        if (normalizeStatus(p.status) === statusFilter) return true;
        const email = (p.email || '').trim().toLowerCase();
        return applications.some((a) => (a.email || '').trim().toLowerCase() === email && getRecruitingStage(a) === statusFilter);
      });
    }
    return items.map((p) => {
      const email = (p.email || '').trim().toLowerCase();
      const orders = applications.filter((a) => (a.email || '').trim().toLowerCase() === email);
      const latest = orders[0]; // applications arrive most-recent-first
      return {
        ...p,
        orders,
        viewId: latest?.id || p.demoCandidateId || p.id,
      };
    });
  }, [persons, applications, query, statusFilter]);

  const columns = [
    { key: 'name', header: 'Candidate', render: (v, row) => (
      <Link to={`/candidates/${row.viewId}`} className="text-blue-600 hover:underline font-medium">{v}</Link>
    )},
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone', render: (v) => v || '—' },
    { key: 'status', header: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[normalizeStatus(v)] || 'bg-gray-100 text-gray-800'}`}>{normalizeStatus(v)}</span>
    )},
    { key: 'orders', header: 'Orders', render: (orders) => (
      orders.length === 0
        ? <span className="text-xs text-gray-400 italic">No orders yet</span>
        : (
          <div className="flex flex-col gap-1">
            {orders.map((o) => {
              const st = normalizeStatus(o.status);
              const rs = getRecruitingStage(o);
              return (
                <span key={o.id} className="text-xs">
                  {o.jobTitle} — {rs && rs !== st ? (
                    <><span className="font-medium">{rs}</span>{' · '}<span className="font-medium">{st}</span></>
                  ) : (
                    <span className="font-medium">{st}</span>
                  )}
                </span>
              );
            })}
          </div>
        )
    )},
    { key: 'id', header: 'Submit to order', render: (_, row) => {
      const alreadyOn = (targetJobId) => row.orders.some((o) => String(o.jobId) === String(targetJobId) || String(o.legacyJobId) === String(targetJobId));
      return (
        <div className="flex gap-2 items-center">
          <select
            value={submitJobId[row.email] || ''}
            onChange={(e) => setSubmitJobId((prev) => ({ ...prev, [row.email]: e.target.value }))}
            className="border rounded px-2 py-1 text-xs max-w-[180px]"
            aria-label={`Pick an order for ${row.name}`}
          >
            <option value="">Pick an order…</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id} disabled={alreadyOn(j.id) || alreadyOn(j.legacyId)}>
                {j.title} — {j.client_name || ''}{alreadyOn(j.id) || alreadyOn(j.legacyId) ? ' (already on)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={() => handleSubmitToOrder(row)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs font-medium"
          >
            Submit
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
        <h1 className="text-xl font-semibold">Talent Search</h1>
        <button
          onClick={() => setQuickAddOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Quick Add Candidate
        </button>
      </div>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared talent pool is unreachable right now. Changes here will sync when it comes back.
        </p>
      )}

      <p className="text-sm text-gray-600 mb-4">
        Search covers name, email, and phone. Skills, location, and availability aren&apos;t stored on
        candidate records yet, so they can&apos;t be searched — that&apos;s in the backlog.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or phone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm w-80"
        />
        <label className="text-sm text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {['All', 'Applied', 'Reviewed', 'Submitted', 'Interview', 'Hired', 'Rejected', 'Active Assignment', 'Assignment Ended'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500">{rows.length} candidate{rows.length !== 1 ? 's' : ''}</span>
      </div>

      {rows.length === 0 ? (
        <Empty title="No candidates found" hint="Try a different search, or add a candidate with Quick Add." />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={10} />
      )}

      <QuickAddCandidate
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreated={() => load()}
      />
    </div>
  );
}
