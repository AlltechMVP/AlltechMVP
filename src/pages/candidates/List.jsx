import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getCandidates, getJobById, normalizeStatus,
  getAllowedTransitions, changeCandidateStatus,
  getRecentClientDecisions, setAssignmentPrefill
} from '@/utils/storage';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty } from '@/components/ui';
import { useToasts } from '@/components/ui/ToastProvider.jsx';
import { useNavigate } from 'react-router-dom';

const FILTER_OPTIONS = ['All', 'Applied', 'Reviewed', 'Submitted', 'Interview', 'Hired', 'Rejected', 'Active Assignment', 'Assignment Ended'];

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

const ACTION_LABELS = {
  'Reviewed': { label: 'Mark Reviewed', cls: 'bg-blue-600 hover:bg-blue-700' },
  'Submitted': { label: 'Submit to Client', cls: 'bg-indigo-600 hover:bg-indigo-700' },
  'Interview': { label: 'Schedule Interview', cls: 'bg-purple-600 hover:bg-purple-700' },
  'Hired': { label: 'Mark Hired', cls: 'bg-emerald-600 hover:bg-emerald-700' },
  'Rejected': { label: 'Reject', cls: 'bg-red-600 hover:bg-red-700' },
};

export default function CandidatesList() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [data, setData] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [showDecisions, setShowDecisions] = useState(true);
  const { addToast } = useToasts();
  const navigate = useNavigate();

  useEffect(() => {
    setData(getCandidates());
    setDecisions(getRecentClientDecisions(30));
  }, []);

  const handleCreateAssignment = (candidateId, jobId) => {
    setAssignmentPrefill(candidateId, jobId);
    navigate('/assignments/new');
  };

  const handleAction = (candidateId, newStatus) => {
    let note;
    if (newStatus === 'Rejected') {
      note = prompt('Rejection reason:');
      if (note === null) return;
    }

    const result = changeCandidateStatus(candidateId, newStatus, { note });
    if (result) {
      setData(getCandidates());
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
      const job = c.submittedJobId ? getJobById(c.submittedJobId) : null;
      return {
        id: c.id,
        name: c.name,
        email: c.email || '-',
        job: job?.title || '-',
        status,
        lastAction: c.lastActionAt ? new Date(c.lastActionAt).toLocaleDateString() : '-',
        _sortDate: c.lastActionAt || c.createdAt || '',
        allowed: getAllowedTransitions(status),
      };
    }).sort((a, b) => (b._sortDate || '').localeCompare(a._sortDate || ''));
  }, [data, statusFilter]);

  const columns = [
    { key: 'name', header: 'Candidate', render: (v, row) => (
      <Link to={`/candidates/${row.id}`} className="text-blue-600 hover:underline font-medium">{v}</Link>
    )},
    { key: 'email', header: 'Email' },
    { key: 'job', header: 'Job' },
    { key: 'status', header: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v] || 'bg-gray-100 text-gray-800'}`}>{v}</span>
    )},
    { key: 'lastAction', header: 'Last Action' },
    { key: 'id', header: 'Actions', render: (_, row) => {
      if (row.allowed.length === 0) {
        return <span className="text-xs text-gray-400 italic">No actions available</span>;
      }
      return (
        <div className="flex gap-1 flex-wrap">
          {row.allowed.map(s => {
            const isReopen = s === 'Reviewed' && row.status === 'Rejected';
            const a = isReopen
              ? { label: 'Reopen', cls: 'bg-yellow-500 hover:bg-yellow-600' }
              : ACTION_LABELS[s];
            if (!a) return null;
            return (
              <button
                key={s}
                onClick={() => handleAction(row.id, s)}
                className={`text-white px-2 py-1 rounded text-xs font-medium ${a.cls}`}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      );
    }},
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Candidate Pipeline</h1>
      </div>

      {decisions.length > 0 && showDecisions && (
        <div className="mb-6 border border-blue-200 rounded-xl bg-blue-50/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-blue-100/60 border-b border-blue-200">
            <h2 className="text-sm font-semibold text-blue-900">Client Decisions ({decisions.length})</h2>
            <button onClick={() => setShowDecisions(false)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Dismiss</button>
          </div>
          <div className="divide-y divide-blue-100">
            {decisions.map(d => (
              <div key={d.candidateId} className="px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900">{d.candidateName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.decision === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {d.decision}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {d.jobTitle} &middot; {d.decidedAt ? new Date(d.decidedAt).toLocaleDateString() : ''}
                    {d.note && <span className="ml-2 italic text-gray-400">&quot;{d.note}&quot;</span>}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {d.decision === 'Approved' ? (
                    <button
                      onClick={() => handleCreateAssignment(d.candidateId, d.jobId)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                    >
                      Create Assignment
                    </button>
                  ) : (
                    <Link
                      to={`/candidates/${d.candidateId}`}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-xs font-medium"
                    >
                      View Candidate
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {FILTER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <Empty title="No candidates found" hint="Candidates will appear here as they enter the pipeline." />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={10} />
      )}
    </div>
  );
}
