import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getJobs, getCandidates, applyToJob } from '@/utils/storage';
import {
  fetchJobs, fetchApplications, fetchAppliedJobIds, syncCandidateToSupabase,
  reconcilePipeline,
} from '@/lib/pipeline';
import { useAuth } from '@/context/AuthContext.jsx';
import { useToasts } from '@/components/ui/ToastProvider.jsx';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty } from '@/components/ui';

// Slice 1 (thin): jobs + applications read from Supabase (shared across
// sessions) with a demo-store fallback when Supabase is unreachable, so a
// sales presentation never breaks on wifi. Writes still go to the demo
// store as today, then sync to Supabase (best-effort, fire-and-forget).
export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [applyingJob, setApplyingJob] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [formError, setFormError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);
  const { session } = useAuth();
  const { addToast } = useToasts();

  const userEmail = session?.user?.email || '';
  const userName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || '';

  const loadSupabaseApplications = async (email) => {
    const apps = await fetchApplications();
    setApplications(apps);
    setUsingFallback(false);
    if (email) {
      const ids = await fetchAppliedJobIds(email);
      setAppliedJobIds(ids.map(String));
    }
  };

  const refreshApplications = async (email) => {
    try {
      await loadSupabaseApplications(email);
    } catch {
      try {
        // The shared fetch failed: try the reconcile (it re-syncs and
        // re-fetches) before falling back to local demo data.
        await reconcilePipeline();
        await loadSupabaseApplications(email);
      } catch {
        // Demo fallback: derive from localStorage.
        const demo = getCandidates();
        setApplications(demo.map((c) => ({ jobId: c.submittedJobId })));
        setUsingFallback(true);
        if (email) {
          const normalized = email.trim().toLowerCase();
          setAppliedJobIds(
            demo
              .filter((c) => (c.email || '').trim().toLowerCase() === normalized)
              .map((c) => String(c.submittedJobId))
          );
        }
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchJobs();
        if (mounted) setJobs(data);
      } catch {
        if (mounted) { setJobs(getJobs()); setUsingFallback(true); }
      }
      if (mounted) refreshApplications(userEmail);
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!userEmail) return;
    refreshApplications(userEmail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  const openApply = (job) => {
    setApplyingJob(job);
    setForm({ name: userName, email: userEmail, phone: '' });
    setFormError('');
  };

  const submitApply = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setFormError('Name and email are required to apply.');
      return;
    }
    const result = applyToJob(applyingJob.id, form, userEmail || form.email);
    if (!result) {
      addToast({ message: 'Could not submit the application. Please try again.', kind: 'error' });
      return;
    }
    if (!result.alreadyApplied) {
      addToast({ message: 'Application submitted — you are now in the recruiter pipeline as Applied.', kind: 'success' });
      // Sync the new demo row to Supabase (shared pipeline); never blocks the toast.
      syncCandidateToSupabase(result.candidate)
        .then(() => refreshApplications(userEmail))
        .catch(() => {});
    } else {
      addToast({ message: 'You already applied to this job.', kind: 'success' });
    }
    setAppliedJobIds((prev) => (prev.includes(String(applyingJob.id)) ? prev : [...prev, String(applyingJob.id)]));
    setApplyingJob(null);
  };

  const rows = useMemo(() => {
    return jobs.map(j => {
      const candCount = applications.filter(a => String(a.jobId) === String(j.id)).length;
      return {
        id: j.id,
        title: j.title,
        client: j.client_name || '—',
        location: j.location || '—',
        rate: j.rate ? `$${j.rate}/hr` : '—',
        openings: j.openings ?? '—',
        status: j.status,
        candidates: candCount,
      };
    });
  }, [jobs, applications]);

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'client', header: 'Client' },
    { key: 'location', header: 'Location' },
    { key: 'rate', header: 'Rate' },
    { key: 'openings', header: 'Openings' },
    { key: 'status', header: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{v}</span>
    )},
    { key: 'candidates', header: 'Candidates', render: (v) => (
      <span className="font-medium">{v}</span>
    )},
    { key: 'id', header: '', render: (_, row) => (
      <span className="flex gap-3 items-center whitespace-nowrap">
        <Link to={`/jobs/${row.id}/candidates`} className="text-blue-600 hover:underline text-xs font-medium">View Candidates</Link>
        {appliedJobIds.includes(String(row.id)) ? (
          <span className="text-green-700 text-xs font-medium">Applied ✓</span>
        ) : (
          <button
            onClick={() => openApply(jobs.find((j) => String(j.id) === String(row.id)))}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium"
          >
            Apply
          </button>
        )}
      </span>
    )},
  ];

  if (jobs.length === 0) {
    return <div className="p-4"><Empty title="No jobs found" /></div>;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Jobs</h1>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared pipeline is unreachable right now. Changes here will sync when it comes back.
        </p>
      )}

      {applyingJob && (
        <form onSubmit={submitApply} className="mb-6 border rounded-lg bg-white shadow-sm p-4">
          <h2 className="text-base font-semibold mb-1">Apply to {applyingJob.title}</h2>
          <p className="text-sm text-gray-600 mb-3">{applyingJob.client_name || ''}{applyingJob.location ? ` · ${applyingJob.location}` : ''}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-700">Full name</span>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-700">Phone (optional)</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
              />
            </label>
          </div>
          {formError && <p className="text-red-600 text-sm mt-2">{formError}</p>}
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Submit application</button>
            <button type="button" onClick={() => setApplyingJob(null)} className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      <DataTable columns={columns} rows={rows} pageSize={10} />
    </div>
  );
}
