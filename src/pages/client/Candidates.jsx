import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getJobById, getSubmittedCandidatesForJob,
  clientDecideCandidate, normalizeStatus
} from '@/utils/storage';
import { useDemoClientId } from '@/lib/useDemoClientId';
import { useToasts } from '@/components/ui/ToastProvider.jsx';
import { Empty, AccessDenied } from '@/components/ui';

const STATUS_COLORS = {
  'Submitted': 'bg-indigo-100 text-indigo-800',
  'Interview': 'bg-purple-100 text-purple-800',
  'Hired': 'bg-emerald-100 text-emerald-800',
  'Rejected': 'bg-red-100 text-red-800',
};

const DECISION_COLORS = {
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
};

export default function ClientCandidates() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const demoClientId = useDemoClientId();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState('All');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const reload = () => {
    const j = getJobById(jobId);
    setJob(j);
    if (j) {
      setCandidates(getSubmittedCandidatesForJob(jobId));
    }
  };

  useEffect(() => {
    reload();
  }, [jobId]);

  const filtered = useMemo(() => {
    if (filter === 'All') return candidates;
    if (filter === 'Pending') return candidates.filter(c => !c.clientDecision);
    if (filter === 'Approved') return candidates.filter(c => c.clientDecision === 'Approved');
    if (filter === 'Rejected') return candidates.filter(c => c.clientDecision === 'Rejected');
    return candidates;
  }, [candidates, filter]);

  const handleApprove = (candidateId) => {
    const result = clientDecideCandidate(candidateId, 'Approved');
    if (result) {
      addToast({ type: 'success', message: 'Candidate approved.' });
      reload();
    }
  };

  const handleRejectConfirm = () => {
    if (!rejectNote.trim()) {
      addToast({ type: 'error', message: 'Please provide a rejection reason.' });
      return;
    }
    const result = clientDecideCandidate(rejectModal, 'Rejected', { note: rejectNote.trim() });
    if (result) {
      addToast({ type: 'success', message: 'Candidate rejected.' });
      setRejectModal(null);
      setRejectNote('');
      reload();
    }
  };

  if (!job) {
    return (
      <div className="p-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Job not found.{' '}
          <button onClick={() => navigate('/client/jobs')} className="underline font-medium">Back to jobs</button>
        </div>
      </div>
    );
  }

  // A client may only open their own company's order — a job id typed
  // into the URL must not show another company's candidates.
  if (job.clientId !== demoClientId) {
    return <AccessDenied />;
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link to="/client/jobs" className="text-sm text-blue-600 hover:underline">&larr; Back to Jobs</Link>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Candidates for: {job.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{job.location} &middot; ${job.rate}/hr</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {['All', 'Pending', 'Approved', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-gray-400">{filtered.length} candidate(s)</span>
      </div>

      {filtered.length === 0 ? (
        <Empty title="No submitted candidates" hint="Candidates submitted by recruiters will appear here for your review." />
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const status = normalizeStatus(c.status);
            const decided = !!c.clientDecision;
            return (
              <div key={c.id} className="bg-white border rounded-lg p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{c.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}>
                      {status}
                    </span>
                    {c.clientDecision && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DECISION_COLORS[c.clientDecision] || 'bg-gray-100'}`}>
                        Client: {c.clientDecision}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {c.email && <span>{c.email}</span>}
                    {c.phone && <span className="ml-3">{c.phone}</span>}
                  </div>
                  {c.submittedAt && (
                    <div className="text-xs text-gray-400 mt-1">
                      Submitted: {new Date(c.submittedAt).toLocaleDateString()}
                    </div>
                  )}
                  {c.clientDecisionNote && (
                    <div className="text-xs text-gray-500 mt-1 italic">
                      Note: {c.clientDecisionNote}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {!decided && (
                    <>
                      <button
                        onClick={() => handleApprove(c.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => { setRejectModal(c.id); setRejectNote(''); }}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {decided && (
                    <span className="text-xs text-gray-400 italic">Decision made</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Reject Candidate</h3>
            <p className="text-sm text-gray-600 mb-3">Please provide a reason for rejection:</p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm h-24 resize-none"
              placeholder="Enter rejection reason..."
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setRejectModal(null); setRejectNote(''); }}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 font-medium"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
