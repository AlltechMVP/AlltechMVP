import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getCandidates, getJobs, getAssignments, setAssignments,
  getAssignmentById, uid, now, syncCandidateFromAssignment, normalizeStatus,
  getAssignmentPrefill, clearAssignmentPrefill, getActiveAssignmentsForPerson,
} from '@/utils/storage';
import { syncAssignmentToSupabase, fetchAssignment, fetchJobs } from '@/lib/pipeline';
import { useToasts } from '@/components/ui/ToastProvider.jsx';
import { useCapabilities } from '@/lib/capabilities';

export default function AssignmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToasts();
  // Slice 7: creating / editing an assignment is an assignments.manage
  // action (all internal staff by default). The route is auth-only, so the
  // submit is hidden from users who lack the capability (RLS enforces it
  // on the backend too).
  const { hasCapability } = useCapabilities();
  const canManageAssignments = hasCapability('assignments.manage');
  const isEdit = Boolean(id);

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    candidateId: '',
    jobId: '',
    startDate: '',
    endDate: '',
    payRate: '',
    billRate: '',
    status: 'Active',
    notes: '',
  });

  useEffect(() => {
    (async () => {
      setCandidates(getCandidates());
      // ATS/CRM milestone (slice 6): the demo store is the job list, but
      // the seeded jobs' pay rates live on the shared store (backfilled
      // from real assignment rates). Merge them in by legacy id so the
      // rate pre-fill below works for seeded orders too.
      let demoJobs = getJobs();
      try {
        const shared = await fetchJobs();
        const byLegacy = new Map(shared.map((j) => [String(j.legacyId), j]));
        demoJobs = demoJobs.map((j) => {
          const sup = byLegacy.get(String(j.id));
          if (!sup) return j;
          return {
            ...j,
            rate: j.rate ?? sup.rate,
            payRate: j.payRate ?? sup.payRate,
            requirements: j.requirements || sup.requirements || '',
          };
        });
      } catch {
        // Shared store unreachable — demo rates only; manual entry still works.
      }
      setJobs(demoJobs);

      if (isEdit) {
        // Resolve the demo row: by demo id, then by its Supabase id, then
        // fetch the Supabase row and build a demo twin for it.
        let existing = getAssignmentById(id)
          || getAssignments().find((a) => String(a.supabaseAssignmentId) === String(id));
        if (!existing) {
          try {
            const sup = await fetchAssignment(id);
            const demoCandidate = getCandidates().find((c) => c.supabasePersonId === sup.candidateId)
              || getCandidates().find((c) => (c.email || '').trim().toLowerCase() === (sup.candidateEmail || '').trim().toLowerCase())
              || getCandidates().find((c) => String(c.id) === String(sup.legacyCandidateId));
            const demoJob = getJobs().find((j) => String(j.id) === String(sup.legacyJobId))
              || getJobs().find((j) => String(j.id) === String(sup.jobId));
            if (!demoCandidate || !demoJob) throw new Error('no demo twin');
            existing = {
              id: sup.legacyId || String(sup.id),
              candidateId: demoCandidate.id,
              jobId: demoJob.id,
              startDate: sup.startDate,
              endDate: sup.endDate,
              payRate: sup.payRate,
              billRate: sup.billRate,
              status: sup.status,
              notes: sup.notes,
              supabaseAssignmentId: sup.id,
            };
            const all = getAssignments();
            if (!all.some((a) => a.id === existing.id)) {
              all.push({ ...existing, createdAt: sup.createdAt, updatedAt: sup.updatedAt });
              setAssignments(all);
            }
          } catch {
            existing = null;
          }
        }
        if (!existing) {
          addToast({ type: 'error', message: 'Assignment not found.' });
          navigate('/assignments');
          return;
        }
        setForm({
          candidateId: existing.candidateId || '',
          jobId: existing.jobId || '',
          startDate: existing.startDate || '',
          endDate: existing.endDate || '',
          payRate: existing.payRate != null ? String(existing.payRate) : '',
          billRate: existing.billRate != null ? String(existing.billRate) : '',
          status: existing.status || 'Active',
          notes: existing.notes || '',
        });
      } else {
        const prefill = getAssignmentPrefill();
        if (prefill) {
          setForm(prev => ({
            ...prev,
            candidateId: prefill.candidateId || '',
            jobId: prefill.jobId || '',
          }));
          clearAssignmentPrefill();
          addToast({ type: 'info', message: 'Candidate and job pre-filled from client decision.' });
        }
      }
    })();
  }, [id, isEdit]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  // ATS/CRM milestone (slice 6): pre-fill the rates from the selected
  // order — bill from the job's rate, pay from its pay_rate — when the
  // fields are still empty. The user can still override both.
  const handleJobChange = (jobIdValue) => {
    const selected = jobs.find((j) => String(j.id) === String(jobIdValue));
    setForm((prev) => ({
      ...prev,
      jobId: jobIdValue,
      payRate: prev.payRate === '' && selected?.payRate != null ? String(selected.payRate) : prev.payRate,
      billRate: prev.billRate === '' && selected?.rate != null ? String(selected.rate) : prev.billRate,
    }));
  };

  // Candidates submitted to the selected order first (Hired first), then
  // everyone else — one row per person (deduped by email), so a candidate
  // on two orders appears once.
  const STAGE_RANK = { Hired: 0, Submitted: 1, Interview: 2, Reviewed: 3, Applied: 4 };
  const candidateOptions = useMemo(() => {
    const onJob = (c) => form.jobId
      ? (String(c.submittedJobId) === String(form.jobId) || String(c.currentJobId) === String(form.jobId))
      : false;
    const ordered = [...candidates].sort((a, b) => {
      const aOn = onJob(a) ? 0 : 1;
      const bOn = onJob(b) ? 0 : 1;
      if (aOn !== bOn) return aOn - bOn;
      return (STAGE_RANK[normalizeStatus(a.status)] ?? 5) - (STAGE_RANK[normalizeStatus(b.status)] ?? 5);
    });
    const byEmail = new Map();
    for (const c of ordered) {
      const email = (c.email || '').trim().toLowerCase();
      if (email) {
        if (!byEmail.has(email)) byEmail.set(email, c);
      } else if (!byEmail.has(c.id)) {
        byEmail.set(c.id, c);
      }
    }
    return [...byEmail.values()];
  }, [candidates, form.jobId]);

  // ATS/CRM milestone (slice 6): warn — don't block, don't end — when the
  // selected candidate already has an Active assignment. The other
  // assignment is preserved.
  const selectedCandidate = candidates.find((c) => c.id === form.candidateId) || null;
  const otherActive = selectedCandidate
    ? getActiveAssignmentsForPerson(selectedCandidate.email, isEdit ? id : null)
    : [];
  const otherActiveJob = otherActive.length > 0
    ? jobs.find((j) => String(j.id) === String(otherActive[0].jobId))
    : null;

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.candidateId || !form.jobId || !form.startDate) {
      addToast({ type: 'error', message: 'Candidate, Job, and Start Date are required.' });
      return;
    }

    const payRate = form.payRate ? parseFloat(form.payRate) : null;
    const billRate = form.billRate ? parseFloat(form.billRate) : null;

    if (form.payRate && (isNaN(payRate) || payRate < 0)) {
      addToast({ type: 'error', message: 'Pay Rate must be a valid positive number.' });
      return;
    }
    if (form.billRate && (isNaN(billRate) || billRate < 0)) {
      addToast({ type: 'error', message: 'Bill Rate must be a valid positive number.' });
      return;
    }

    const all = getAssignments();
    const timestamp = now();

    if (isEdit) {
      const idx = all.findIndex((a) => a.id === id || String(a.supabaseAssignmentId) === String(id));
      if (idx !== -1) {
        all[idx] = {
          ...all[idx],
          candidateId: form.candidateId,
          jobId: form.jobId,
          startDate: form.startDate,
          endDate: form.endDate || null,
          payRate,
          billRate,
          status: form.status,
          notes: form.notes || null,
          updatedAt: timestamp,
        };
      }
    } else {
      all.push({
        id: uid(),
        candidateId: form.candidateId,
        jobId: form.jobId,
        startDate: form.startDate,
        endDate: form.endDate || null,
        payRate,
        billRate,
        status: form.status,
        notes: form.notes || null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    setAssignments(all);

    const savedAssignment = isEdit
      ? all.find((a) => a.id === id || String(a.supabaseAssignmentId) === String(id))
      : all[all.length - 1];

    const syncResult = syncCandidateFromAssignment(savedAssignment);
    // Sync the assignment row itself to Supabase before navigating, so
    // the list the user lands on re-fetches after the sync has landed
    // (a fire-and-forget sync here loses the race and the new
    // assignment only appears after a manual reload).
    if (savedAssignment) await syncAssignmentToSupabase(savedAssignment);
    const preservedNote = otherActive.length > 0
      ? ` Note: ${selectedCandidate?.name || 'This candidate'} already had an Active assignment (${otherActiveJob?.title || 'another order'}) — it was preserved, not ended.`
      : '';
    if (syncResult) {
      addToast({ type: 'success', message: `Assignment saved — candidate status updated to ${syncResult}.${preservedNote}` });
    } else {
      addToast({ type: 'success', message: `${isEdit ? 'Assignment updated.' : 'Assignment created.'}${preservedNote}` });
    }
    navigate('/assignments');
  };

  const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Assignment' : 'Create Assignment'}</h1>

      <form onSubmit={handleSave} className="space-y-4 bg-white border rounded-xl p-6">
        <div>
          <label className={labelCls}>Candidate *</label>
          <select value={form.candidateId} onChange={e => update('candidateId', e.target.value)} className={inputCls}>
            <option value="">Select a candidate</option>
            {candidateOptions.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email}){form.jobId && (String(c.submittedJobId) === String(form.jobId) || String(c.currentJobId) === String(form.jobId)) ? ' — on this order' : ''}</option>)}
          </select>
          {form.jobId && candidateOptions.some((c) => String(c.submittedJobId) === String(form.jobId) || String(c.currentJobId) === String(form.jobId)) && (
            <p className="text-xs text-gray-500 mt-1">Candidates submitted to this order are listed first.</p>
          )}
          {otherActive.length > 0 && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2 mt-2">
              Heads up: {selectedCandidate?.name} already has an Active assignment
              {otherActiveJob ? ` (${otherActiveJob.title})` : ''}. Creating this one will keep both —
              the existing assignment will NOT be ended.
            </p>
          )}
        </div>

        <div>
          <label className={labelCls}>Job *</label>
          <select value={form.jobId} onChange={e => handleJobChange(e.target.value)} className={inputCls}>
            <option value="">Select a job</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title} - {j.client_name || j.client || 'N/A'}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Start Date *</label>
            <input type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>End Date</label>
            <input type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Pay Rate ($/hr)</label>
            <input type="number" step="0.01" min="0" value={form.payRate} onChange={e => update('payRate', e.target.value)} className={inputCls} placeholder="0.00" />
          </div>
          <div>
            <label className={labelCls}>Bill Rate ($/hr)</label>
            <input type="number" step="0.01" min="0" value={form.billRate} onChange={e => update('billRate', e.target.value)} className={inputCls} placeholder="0.00" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Status</label>
          <select value={form.status} onChange={e => update('status', e.target.value)} className={inputCls}>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Ended">Ended</option>
          </select>
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea rows={3} value={form.notes} onChange={e => update('notes', e.target.value)} className={inputCls} placeholder="Optional notes..." />
        </div>

        <div className="flex items-center gap-3 pt-2">
          {canManageAssignments ? (
            <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              {isEdit ? 'Update Assignment' : 'Create Assignment'}
            </button>
          ) : (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              You do not have permission to create or edit assignments.
            </p>
          )}
          <button type="button" onClick={() => navigate('/assignments')} className="border px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
