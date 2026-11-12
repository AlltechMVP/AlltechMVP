import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTimesheets, getAssignmentById, getCandidateById, getJobById } from '@/utils/storage';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty } from '@/components/ui';

const STATUS_OPTIONS = ['All', 'Draft', 'Submitted', 'Approved', 'Rejected'];
const CLIENT_FILTER_OPTIONS = ['All', 'Awaiting Client', 'Client Approved', 'Client Rejected', 'Not Submitted'];

export default function TimesheetsList() {
  const [statusFilter, setStatusFilter] = useState('All');
  const [clientFilter, setClientFilter] = useState('All');
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(getTimesheets());
  }, []);

  const rows = useMemo(() => {
    let items = data;
    if (statusFilter !== 'All') {
      items = items.filter(t => t.status === statusFilter);
    }
    if (clientFilter !== 'All') {
      items = items.filter(t => {
        const cs = t.clientApprovalStatus || 'Not Submitted';
        if (clientFilter === 'Awaiting Client') return cs === 'Submitted';
        if (clientFilter === 'Client Approved') return cs === 'Approved';
        if (clientFilter === 'Client Rejected') return cs === 'Rejected';
        if (clientFilter === 'Not Submitted') return cs === 'Not Submitted';
        return true;
      });
    }
    return items.map(t => {
      const assignment = getAssignmentById(t.assignmentId);
      const cand = assignment ? getCandidateById(assignment.candidateId) : null;
      const job = assignment ? getJobById(assignment.jobId) : null;
      return {
        id: t.id,
        candidate: cand?.name || '-',
        job: job?.title || '-',
        weekEnding: t.weekEnding || '-',
        totalHours: t.totalHours ?? 0,
        status: t.status,
        clientApproval: t.clientApprovalStatus || 'Not Submitted',
        payrollStatus: t.payrollStatus || 'Not Ready',
        updated: t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : '-',
        _sortDate: t.updatedAt || t.createdAt || '',
      };
    }).sort((a, b) => (b._sortDate || '').localeCompare(a._sortDate || ''));
  }, [data, statusFilter, clientFilter]);

  const payrollColors = {
    'Not Ready': 'bg-gray-100 text-gray-800',
    'Ready': 'bg-emerald-100 text-emerald-800',
    'In Payroll': 'bg-indigo-100 text-indigo-800',
    'Paid': 'bg-green-100 text-green-800',
  };

  const clientApprovalColors = {
    'Not Submitted': 'bg-gray-100 text-gray-500',
    'Submitted': 'bg-yellow-100 text-yellow-800',
    'Approved': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
  };

  const columns = [
    { key: 'candidate', header: 'Candidate' },
    { key: 'job', header: 'Job' },
    { key: 'weekEnding', header: 'Week Ending' },
    { key: 'totalHours', header: 'Hours' },
    { key: 'status', header: 'Status', render: (v) => {
      const colors = {
        Draft: 'bg-gray-100 text-gray-800',
        Submitted: 'bg-blue-100 text-blue-800',
        Approved: 'bg-green-100 text-green-800',
        Rejected: 'bg-red-100 text-red-800',
      };
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[v] || ''}`}>{v}</span>;
    }},
    { key: 'clientApproval', header: 'Client', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${clientApprovalColors[v] || ''}`}>{v === 'Not Submitted' ? '-' : v}</span>
    )},
    { key: 'payrollStatus', header: 'Payroll', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${payrollColors[v] || ''}`}>{v}</span>
    )},
    { key: 'id', header: '', render: (_, row) => (
      <Link to={`/timekeeping/${row.id}`} className="text-blue-600 hover:underline text-xs">View</Link>
    )},
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Timesheets</h1>
        <Link
          to="/timekeeping/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Create Timesheet
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <label className="text-sm text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="text-sm text-gray-600 ml-2">Client:</label>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {CLIENT_FILTER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <Empty title="No timesheets found" hint="Create your first timesheet to get started." />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={10} />
      )}
    </div>
  );
}
