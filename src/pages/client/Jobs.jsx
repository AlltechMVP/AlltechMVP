import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  getJobsForClient, getClientById,
  getSubmittedCandidatesForJob
} from '@/utils/storage';
import { useDemoClientId } from '@/lib/useDemoClientId';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty } from '@/components/ui';

const STATUS_COLORS = {
  'Open': 'bg-green-100 text-green-800',
  'On Hold': 'bg-yellow-100 text-yellow-800',
  'Closed': 'bg-gray-100 text-gray-800',
};

export default function ClientJobs() {
  const [jobs, setJobs] = useState([]);
  const [client, setClient] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const demoClientId = useDemoClientId();

  useEffect(() => {
    const clientId = demoClientId;
    setClient(getClientById(clientId));
    setJobs(getJobsForClient(clientId));
  }, [demoClientId]);

  const rows = useMemo(() => {
    let items = jobs;
    if (statusFilter !== 'All') {
      items = items.filter(j => j.status === statusFilter);
    }
    return items.map(j => {
      const submitted = getSubmittedCandidatesForJob(j.id);
      const pending = submitted.filter(c => !c.clientDecision || c.clientDecision === 'Pending');
      return {
        ...j,
        submittedCount: submitted.length,
        pendingCount: pending.length,
      };
    });
  }, [jobs, statusFilter]);

  const columns = [
    { key: 'title', header: 'Job Title', render: (v) => <span className="font-medium">{v}</span> },
    { key: 'location', header: 'Location' },
    { key: 'status', header: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v] || 'bg-gray-100 text-gray-800'}`}>{v}</span>
    )},
    { key: 'openings', header: 'Openings' },
    { key: 'submittedCount', header: 'Candidates', render: (v, row) => (
      <span>
        {v} submitted
        {row.pendingCount > 0 && <span className="ml-1 text-amber-600 font-medium">({row.pendingCount} pending)</span>}
      </span>
    )},
    { key: 'id', header: 'Actions', render: (_, row) => (
      <Link
        to={`/client/jobs/${row.id}/candidates`}
        className="text-blue-600 hover:underline text-sm font-medium"
      >
        View Candidates
      </Link>
    )},
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold">Your Jobs</h1>
          {client && <p className="text-sm text-gray-500 mt-1">{client.name}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm"
        >
          {['All', 'Open', 'On Hold', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <Empty title="No jobs found" hint="Jobs assigned to your account will appear here." />
      ) : (
        <DataTable columns={columns} rows={rows} pageSize={10} />
      )}
    </div>
  );
}
