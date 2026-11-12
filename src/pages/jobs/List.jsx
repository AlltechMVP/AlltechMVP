import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getJobs, getCandidates, applyToJob } from '@/utils/storage';
import { useAuth } from '@/context/AuthContext.jsx';
import { useToasts } from '@/components/ui/ToastProvider.jsx';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty } from '@/components/ui';

export default function JobsList() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [applyingJob, setApplyingJob] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [formError, setFormError] = useState('');
  const { session } = useAuth();
  const { addToast } = useToasts();

  const userEmail = session?.user?.email || '';
  const userName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || '';

  useEffect(() => {
    setJobs(getJobs());
  }, []);

  useEffect(() => {
    if (!userEmail) return;
    const normalized = userEmail.trim().toLowerCase();
    setAppliedJobIds(
      getCandidates()
        .filter((c) => (c.email || '').trim().toLowerCase() === normalized)
        .map((c) => c.submittedJobId)
    );
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
    } else {
      addToast({ message: 'You already applied to this job.', kind: 'success' });
    }
    setAppliedJobIds((prev) => (prev.includes(applyingJob.id) ? prev : [...prev, applyingJob.id]));
    setApplyingJob(null);
  };

  const rows = useMemo(() => {
    const candidates = getCandidates();
    return jobs.map(j => {
      const candCount = candidates.filter(c => c.submittedJobId === j.id || c.currentJobId === j.id).length;
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
  }, [jobs, appliedJobIds]);

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
        {appliedJobIds.includes(row.id) ? (
          <span className="text-green-700 text-xs font-medium">Applied ✓</span>
        ) : (
          <button
            onClick={() => openApply(jobs.find((j) => j.id === row.id))}
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
