import React, { useState, useEffect, useMemo } from 'react';
import {
  getDemoClientId, getTimesheetsForClient,
  getAssignmentById, getCandidateById, getJobById, getClientById,
  clientDecideTimesheet
} from '@/utils/storage';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty } from '@/components/ui';
import { useToasts } from '@/components/ui/ToastProvider.jsx';

const CLIENT_STATUS_COLORS = {
  'Not Submitted': 'bg-gray-100 text-gray-800',
  'Submitted': 'bg-blue-100 text-blue-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
};

export default function ClientTimecards() {
  const { addToast } = useToasts();
  const [timesheets, setTimesheets] = useState([]);
  const [client, setClient] = useState(null);
  const [filter, setFilter] = useState('Pending');
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  const reload = () => {
    const clientId = getDemoClientId();
    setClient(getClientById(clientId));
    setTimesheets(getTimesheetsForClient(clientId));
  };

  useEffect(() => {
    reload();
  }, []);

  const rows = useMemo(() => {
    let items = timesheets.map(t => {
      const assignment = getAssignmentById(t.assignmentId);
      const candidate = assignment ? getCandidateById(assignment.candidateId) : null;
      const job = assignment ? getJobById(assignment.jobId) : null;
      const clientStatus = t.clientApprovalStatus || 'Not Submitted';
      return {
        ...t,
        candidateName: candidate?.name || 'Unknown',
        jobTitle: job?.title || 'Unknown',
        clientStatus,
        _sortDate: t.submittedAt || t.updatedAt || t.createdAt || '',
      };
    });

    if (filter === 'Pending') {
      items = items.filter(r => r.clientStatus === 'Submitted');
    } else if (filter === 'Approved') {
      items = items.filter(r => r.clientStatus === 'Approved');
    } else if (filter === 'Rejected') {
      items = items.filter(r => r.clientStatus === 'Rejected');
    }

    return items.sort((a, b) => (b._sortDate || '').localeCompare(a._sortDate || ''));
  }, [timesheets, filter]);

  const handleApprove = (tsId) => {
    const result = clientDecideTimesheet(tsId, 'Approved');
    if (result) {
      addToast({ type: 'success', message: 'Timecard approved.' });
      reload();
    }
  };

  const handleRejectConfirm = () => {
    if (!rejectNote.trim()) {
      addToast({ type: 'error', message: 'Please provide a rejection reason.' });
      return;
    }
    const result = clientDecideTimesheet(rejectModal, 'Rejected', { note: rejectNote.trim() });
    if (result) {
      addToast({ type: 'success', message: 'Timecard rejected.' });
      setRejectModal(null);
      setRejectNote('');
      reload();
    }
  };

  const columns = [
    { key: 'candidateName', header: 'Candidate', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'jobTitle', header: 'Job' },
    { key: 'weekEnding', header: 'Week Ending' },
    { key: 'totalHours', header: 'Total Hours', render: (v) => <span className="font-medium">{v}h</span> },
    { key: 'clientStatus', header: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CLIENT_STATUS_COLORS[v] || 'bg-gray-100 text-gray-800'}`}>{v}</span>
    )},
    { key: 'id', header: 'Actions', render: (_, row) => {
      if (row.clientStatus !== 'Submitted') {
        if (row.clientStatus === 'Approved') {
          return <span className="text-xs text-green-600 italic">Approved {row.clientDecidedAt ? new Date(row.clientDecidedAt).toLocaleDateString() : ''}</span>;
        }
        if (row.clientStatus === 'Rejected') {
          return (
            <span className="text-xs text-red-600 italic" title={row.clientDecisionNote || ''}>
              Rejected {row.clientDecisionNote ? `- ${row.clientDecisionNote.slice(0, 30)}${row.clientDecisionNote.length > 30 ? '...' : ''}` : ''}
            </span>
          );
        }
        return <span className="text-xs text-gray-400">Not submitted</span>;
      }
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleApprove(row.id)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-xs font-medium"
          >
            Approve
          </button>
          <button
            onClick={() => { setRejectModal(row.id); setRejectNote(''); }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
          >
            Reject
          </button>
        </div>
      );
    }},
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Timecard Approvals</h1>
          {client && <p className="text-sm text-gray-500 mt-1">{client.name}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Show:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {['All', 'Pending', 'Approved', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-xs text-gray-400">{rows.length} timecard(s)</span>
      </div>

      {rows.length === 0 ? (
        <Empty title="No timecards awaiting approval" hint="Timecards submitted for your jobs will appear here." />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={10} />
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">Reject Timecard</h3>
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
