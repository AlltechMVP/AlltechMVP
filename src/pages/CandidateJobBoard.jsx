import React, { useState, useEffect, useMemo } from 'react';
import { getJobs, getCandidates, applyToJob } from '@/utils/storage';
import {
  fetchJobs, fetchAppliedJobIds, syncCandidateToSupabase,
  reconcilePipeline, isRlsDenied,
} from '@/lib/pipeline';
import { useAuth } from '@/context/AuthContext.jsx';
import { useToasts } from '@/components/ui/ToastProvider.jsx';
import { AccessDenied, Empty } from '@/components/ui';

// ATS/CRM milestone (slice 6): the board reads the REAL open jobs from the
// shared store (fetchJobs, demo fallback) and Apply routes through the SAME
// application flow the recruiter pipeline uses (applyToJob) — a signed-in
// candidate's application appears on the correct order in
// /jobs/:jobId/candidates. Applied jobs show "Applied ✓" and refuse
// duplicates. The old static ../data/openJobs mock and the alert() stub
// are gone.

function splitRequirements(text) {
  if (!text) return [];
  return String(text).split(/[\n;]+/).map((s) => s.trim()).filter(Boolean);
}

export default function CandidateJobBoard() {
  const { session } = useAuth();
  const { addToast } = useToasts();
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [applyingJob, setApplyingJob] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [formError, setFormError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);
  const [denied, setDenied] = useState(false);

  const userEmail = session?.user?.email || '';
  const userName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || '';

  const loadJobs = async () => {
    try {
      const data = await fetchJobs();
      setJobs(data.filter((j) => (j.status || 'Open') === 'Open'));
      setUsingFallback(false);
    } catch (err) {
      if (isRlsDenied(err)) { setDenied(true); return; }
      setJobs(getJobs().filter((j) => (j.status || 'Open') === 'Open'));
      setUsingFallback(true);
    }
  };

  const refreshApplied = async (email) => {
    if (!email) return;
    try {
      const ids = await fetchAppliedJobIds(email);
      setAppliedJobIds(ids.map(String));
    } catch (err) {
      if (isRlsDenied(err)) { setDenied(true); return; }
      try {
        await reconcilePipeline();
        const ids = await fetchAppliedJobIds(email);
        setAppliedJobIds(ids.map(String));
      } catch {
        const normalized = email.trim().toLowerCase();
        setAppliedJobIds(
          getCandidates()
            .filter((c) => (c.email || '').trim().toLowerCase() === normalized)
            .map((c) => String(c.submittedJobId))
        );
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadJobs();
      if (mounted) refreshApplied(userEmail);
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userEmail) refreshApplied(userEmail);
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
      syncCandidateToSupabase(result.candidate)
        .then(() => refreshApplied(userEmail || form.email))
        .catch(() => {});
    } else {
      addToast({ message: 'You already applied to this job.', kind: 'success' });
    }
    setAppliedJobIds((prev) => (prev.includes(String(applyingJob.id)) ? prev : [...prev, String(applyingJob.id)]));
    setApplyingJob(null);
    setSelectedJob(null);
  };

  const filteredJobs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((job) =>
      (job.title || '').toLowerCase().includes(q)
      || (job.location || '').toLowerCase().includes(q)
      || (job.client_name || '').toLowerCase().includes(q)
    );
  }, [jobs, searchTerm]);

  if (denied) {
    return <AccessDenied />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Positions</h1>
        <input
          type="text"
          placeholder="Search jobs"
          className="px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {usingFallback && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4">
          Showing local demo data — the shared job board is unreachable right now. Changes here will sync when it comes back.
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

      {filteredJobs.length === 0 ? (
        <Empty title="No open positions found" hint="Try a different search, or check back later." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => {
            const applied = appliedJobIds.includes(String(job.id));
            const requirements = splitRequirements(job.requirements);
            return (
              <div key={job.id} className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold">{job.title}</h2>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {job.status || 'Open'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {job.client_name || '—'} | {job.location || '—'}
                    {job.rate ? ` | $${job.rate}/hr` : ''}
                    {job.payRate ? ` (pay $${job.payRate}/hr)` : ''}
                  </p>
                  {job.openings ? <p className="text-sm text-gray-600 mb-2">{job.openings} opening{job.openings === 1 ? '' : 's'}</p> : null}
                  {requirements.length > 0 && (
                    <p className="text-gray-700 mb-4 line-clamp-2">{requirements.join(' · ')}</p>
                  )}

                  <div className="border-t pt-4 mt-4">
                    {requirements.length > 0 && (
                      <>
                        <h3 className="font-medium mb-2">Key Requirements:</h3>
                        <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
                          {requirements.slice(0, 2).map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    <div className="flex justify-between items-center">
                      <button
                        className="text-blue-600 text-sm hover:underline"
                        onClick={() => setSelectedJob(job)}
                      >
                        View Details
                      </button>
                      <button
                        className={`px-4 py-2 rounded-lg ${
                          applied
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        onClick={() => openApply(job)}
                        disabled={applied}
                      >
                        {applied ? 'Applied ✓' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-2">{selectedJob.client_name || ''} — {selectedJob.location || ''}</p>
                {selectedJob.rate ? <p className="text-gray-600">Bill Rate: ${selectedJob.rate}/hr</p> : null}
                {selectedJob.payRate ? <p className="text-gray-600">Pay Rate: ${selectedJob.payRate}/hr</p> : null}
                {selectedJob.openings ? <p className="text-gray-600">Openings: {selectedJob.openings}</p> : null}
              </div>

              {splitRequirements(selectedJob.requirements).length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {splitRequirements(selectedJob.requirements).map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t">
                <button
                  className={`w-full py-2 rounded-lg ${
                    appliedJobIds.includes(String(selectedJob.id))
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  onClick={() => openApply(selectedJob)}
                  disabled={appliedJobIds.includes(String(selectedJob.id))}
                >
                  {appliedJobIds.includes(String(selectedJob.id)) ? 'Already Applied' : 'Apply Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
