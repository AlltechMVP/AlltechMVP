import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssignments, getCandidateById, getJobById } from '@/utils/storage';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty } from '@/components/ui';

const STATUS_OPTIONS = ['All', 'Active', 'Ended', 'On Hold'];

export default function AssignmentsList() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(getAssignments());
  }, []);

  const rows = useMemo(() => {
    let items = data;
    if (statusFilter !== 'All') {
      items = items.filter(a => a.status === statusFilter);
    }
    return items.map(a => {
      const cand = getCandidateById(a.candidateId);
      const job = getJobById(a.jobId);
      return {
        id: a.id,
        candidate: cand?.name || a.candidateId,
        candidateStatus: cand?.status || '-',
        job: job?.title || a.jobId,
        startDate: a.startDate || '-',
        status: a.status,
        payRate: a.payRate != null ? `$${a.payRate}` : '-',
        billRate: a.billRate != null ? `$${a.billRate}` : '-',
        updated: a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : '-',
        _sortDate: a.updatedAt || a.createdAt || '',
      };
    }).sort((a, b) => (b._sortDate || '').localeCompare(a._sortDate || ''));
  }, [data, statusFilter]);

  const columns = [
    { key: 'candidate', header: 'Candidate' },
    { key: 'candidateStatus', header: 'Cand. Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        v === 'Active Assignment' ? 'bg-green-100 text-green-800' :
        v === 'Assigned' ? 'bg-blue-100 text-blue-800' :
        v === 'Assignment Ended' ? 'bg-gray-100 text-gray-800' :
        'bg-purple-100 text-purple-800'
      }`}>{v}</span>
    )},
    { key: 'job', header: 'Job' },
    { key: 'startDate', header: 'Start Date' },
    { key: 'status', header: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        v === 'Active' ? 'bg-green-100 text-green-800' :
        v === 'Ended' ? 'bg-gray-100 text-gray-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>{v}</span>
    )},
    { key: 'payRate', header: 'Pay Rate' },
    { key: 'billRate', header: 'Bill Rate' },
    { key: 'updated', header: 'Updated' },
    { key: 'id', header: '', render: (_, row) => (
      <Link to={`/assignments/${row.id}`} className="text-blue-600 hover:underline text-xs">Edit</Link>
    )},
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Assignments</h1>
        <Link
          to="/assignments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Create Assignment
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <Empty title="No assignments found" hint="Create your first assignment to get started." />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={10} />
      )}
    </div>
  );
}
