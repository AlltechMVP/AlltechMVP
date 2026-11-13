import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  findCandidateByEmail, createCandidate, submitCandidateToJob,
} from '@/utils/storage';
import { syncCandidateToSupabase } from '@/lib/pipeline';
import { useAuth } from '@/context/AuthContext.jsx';
import { useToasts } from '@/components/ui/ToastProvider.jsx';

const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

// Quick Add Candidate: minimal required fields, live duplicate flag by
// email. Creates a candidate RECORD only — login access is provisioned
// separately by an admin, never by Quick Add. When launched inside an
// order (jobId given), the order stays selected and the new candidate is
// submitted to it immediately, so they can be worked without re-entering.
export function QuickAddCandidateForm({ jobId, jobTitle, onCancel, onCreated }) {
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const { session } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // Live duplicate flag: a person with this email already exists.
  const duplicate = useMemo(() => {
    const email = form.email.trim().toLowerCase();
    if (!email) return null;
    return findCandidateByEmail(email);
  }, [form.email]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }
    const created = createCandidate(form);
    if (!created) {
      setError('Could not create the candidate. Please try again.');
      return;
    }
    let candidate = created.candidate;
    let submitted = false;
    if (jobId) {
      const result = submitCandidateToJob(candidate.id, jobId, session?.user?.email || 'recruiter');
      if (result && !result.alreadySubmitted) {
        submitted = true;
        candidate = result.candidate;
        syncCandidateToSupabase(candidate).catch(() => {});
      } else if (result?.alreadySubmitted) {
        submitted = true;
      }
    }
    if (created.alreadyExists && !submitted) {
      addToast({ message: `${candidate.name} already exists — reused the existing profile.`, kind: 'success' });
    } else if (submitted) {
      addToast({ message: `${candidate.name} added and submitted to ${jobTitle || 'the order'}.`, kind: 'success' });
    } else {
      addToast({ message: `${candidate.name} added to the talent pool.`, kind: 'success' });
    }
    if (onCreated) onCreated(candidate, { submitted, alreadyExists: created.alreadyExists });
    else navigate(`/candidates/${candidate.id}`);
  };

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {jobId && (
        <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          Adding to order: <span className="font-medium text-gray-900">{jobTitle || jobId}</span> — the candidate will be submitted to this order right away.
        </p>
      )}

      <div>
        <label className={labelCls}>Full name *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          className={inputCls}
          placeholder="e.g. Jordan Lee"
          autoFocus
        />
      </div>

      <div>
        <label className={labelCls}>Email *</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className={inputCls}
          placeholder="jordan.lee@example.com"
        />
      </div>

      {duplicate && (
        <div className="border border-amber-300 bg-amber-50 rounded-lg px-3 py-2 text-sm">
          <p className="font-medium text-amber-800">Likely duplicate — this email already exists:</p>
          <p className="mt-1">
            <Link to={`/candidates/${duplicate.id}`} className="text-blue-700 hover:underline font-medium">
              {duplicate.name} ({duplicate.email})
            </Link>
            <span className="text-amber-800"> — the existing profile will be reused instead of creating a duplicate.</span>
          </p>
        </div>
      )}

      <div>
        <label className={labelCls}>Phone (optional)</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
          className={inputCls}
          placeholder="555-0100"
        />
      </div>

      <p className="text-xs text-gray-500">
        Quick Add creates a candidate record only. Login access is provisioned separately by an admin.
      </p>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          {jobId ? 'Add & Submit to Order' : 'Add candidate'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="border px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// Modal wrapper used from the nav, the talent search, and inside an order.
export default function QuickAddCandidate({ open, onClose, jobId, jobTitle, onCreated }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg mt-10 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Quick Add Candidate</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl leading-none" aria-label="Close">×</button>
        </div>
        <QuickAddCandidateForm
          jobId={jobId}
          jobTitle={jobTitle}
          onCancel={onClose}
          onCreated={(candidate, meta) => {
            onClose();
            if (onCreated) onCreated(candidate, meta);
          }}
        />
      </div>
    </div>
  );
}
