import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getCandidates, getJobs, getAssignments, setAssignments,
  getAssignmentById, uid, now, syncCandidateFromAssignment,
  getAssignmentPrefill, clearAssignmentPrefill
} from '@/utils/storage';
import { useToasts } from '@/components/ui/ToastProvider.jsx';

export default function AssignmentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToasts();
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
    setCandidates(getCandidates());
    setJobs(getJobs());

    if (isEdit) {
      const existing = getAssignmentById(id);
      if (!existing) {
        addToast({ type: 'error', message: 'Assignment not found.' });
        navigate('/assignments');
        return;
      }
      if (existing) {
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
      }
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
  }, [id, isEdit]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = (e) => {
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
      const idx = all.findIndex(a => a.id === id);
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
      ? all.find(a => a.id === id)
      : all[all.length - 1];

    const syncResult = syncCandidateFromAssignment(savedAssignment);
    if (syncResult) {
      addToast({ type: 'success', message: `Assignment saved — candidate status updated to ${syncResult}.` });
    } else {
      addToast({ type: 'success', message: isEdit ? 'Assignment updated.' : 'Assignment created.' });
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
            {candidates.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
          </select>
        </div>

        <div>
          <label className={labelCls}>Job *</label>
          <select value={form.jobId} onChange={e => update('jobId', e.target.value)} className={inputCls}>
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
          <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            {isEdit ? 'Update Assignment' : 'Create Assignment'}
          </button>
          <button type="button" onClick={() => navigate('/assignments')} className="border px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
