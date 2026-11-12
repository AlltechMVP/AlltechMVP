import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCandidateById, getJobById,
  normalizeStatus, getAllowedTransitions, changeCandidateStatus
} from '@/utils/storage';
import { useToasts } from '@/components/ui/ToastProvider.jsx';

const STATUS_COLORS = {
  'Applied': 'bg-gray-100 text-gray-800',
  'Reviewed': 'bg-blue-100 text-blue-800',
  'Submitted': 'bg-indigo-100 text-indigo-800',
  'Interview': 'bg-purple-100 text-purple-800',
  'Hired': 'bg-emerald-100 text-emerald-800',
  'Rejected': 'bg-red-100 text-red-800',
  'Assigned': 'bg-cyan-100 text-cyan-800',
  'Active Assignment': 'bg-green-100 text-green-800',
  'Assignment Ended': 'bg-orange-100 text-orange-800',
};

const ACTION_CONFIG = {
  'Reviewed': { label: 'Mark Reviewed', cls: 'bg-blue-600 hover:bg-blue-700', desc: 'Move candidate to Reviewed stage' },
  'Submitted': { label: 'Submit to Client', cls: 'bg-indigo-600 hover:bg-indigo-700', desc: 'Submit candidate to client for review' },
  'Interview': { label: 'Schedule Interview', cls: 'bg-purple-600 hover:bg-purple-700', desc: 'Schedule candidate for interview' },
  'Hired': { label: 'Mark Hired', cls: 'bg-emerald-600 hover:bg-emerald-700', desc: 'Mark candidate as hired' },
  'Rejected': { label: 'Reject', cls: 'bg-red-600 hover:bg-red-700', desc: 'Reject this candidate' },
};

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    setCandidate(getCandidateById(id));
  }, [id]);

  if (!candidate) {
    return (
      <div className="p-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Candidate not found.{' '}
          <button onClick={() => navigate('/candidates')} className="underline font-medium">Back to pipeline</button>
        </div>
      </div>
    );
  }

  const status = normalizeStatus(candidate.status);
  const allowed = getAllowedTransitions(status);
  const job = candidate.submittedJobId ? getJobById(candidate.submittedJobId) : null;
  const hasActiveAssignment = status === 'Active Assignment';
  const history = (candidate.statusHistory || []).slice().reverse();

  const handleAction = (newStatus) => {
    let note;
    if (newStatus === 'Rejected') {
      note = prompt('Rejection reason:');
      if (note === null) return;
    }
    const result = changeCandidateStatus(id, newStatus, { note });
    if (result) {
      setCandidate(getCandidateById(id));
      addToast({ type: 'success', message: `Status updated to "${result}".` });
    } else {
      addToast({ type: 'error', message: 'Status transition not allowed.' });
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <button onClick={() => navigate('/candidates')} className="text-blue-600 hover:underline text-sm mb-4 inline-block">&larr; Back to Pipeline</button>

      <div className="bg-white border rounded-xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold">{candidate.name}</h1>
            <p className="text-sm text-gray-600">{candidate.email} {candidate.phone ? `| ${candidate.phone}` : ''}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[status] || 'bg-gray-100'}`}>{status}</span>
        </div>

        {job && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Job:</span> {job.title} ({job.client_name || 'N/A'})
          </div>
        )}

        {hasActiveAssignment && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            Candidate has an active assignment — pipeline actions disabled.
          </div>
        )}

        {status === 'Rejected' && candidate.rejectedReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
            <strong>Rejection reason:</strong> {candidate.rejectedReason}
          </div>
        )}

        {allowed.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Actions</h3>
            <div className="flex gap-2 flex-wrap">
              {allowed.map(s => {
                const isReopen = s === 'Reviewed' && status === 'Rejected';
                const a = isReopen
                  ? { label: 'Reopen', cls: 'bg-yellow-500 hover:bg-yellow-600', desc: 'Reopen candidate to Reviewed stage' }
                  : ACTION_CONFIG[s];
                if (!a) return null;
                return (
                  <button
                    key={s}
                    onClick={() => handleAction(s)}
                    className={`text-white px-4 py-2 rounded-lg text-sm font-medium ${a.cls}`}
                    title={a.desc}
                  >
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {allowed.length === 0 && !hasActiveAssignment && (
          <p className="text-sm text-gray-400 italic">No pipeline actions available for this status.</p>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Status History</h3>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400">No status changes recorded yet.</p>
          ) : (
            <div className="border rounded-lg divide-y">
              {history.map((h, i) => (
                <div key={i} className="px-4 py-3 text-sm flex items-start gap-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                  <div className="flex-1">
                    <div>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[h.from] || 'bg-gray-100'}`}>{h.from}</span>
                      <span className="mx-1.5 text-gray-400">&rarr;</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[h.to] || 'bg-gray-100'}`}>{h.to}</span>
                    </div>
                    {h.note && <p className="text-gray-600 mt-1 text-xs">Note: {h.note}</p>}
                    <p className="text-gray-400 text-xs mt-0.5">{new Date(h.at).toLocaleString()} by {h.by}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
