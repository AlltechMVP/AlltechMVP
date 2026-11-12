import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getJobs, getCandidates } from '@/utils/storage';
import DataTable from '@/components/table/DataTable.jsx';
import { Empty } from '@/components/ui';

export default function JobsList() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    setJobs(getJobs());
  }, []);

  const rows = useMemo(() => {
    const candidates = getCandidates();
    return jobs.map(j => {
      const candCount = candidates.filter(c => c.submittedJobId === j.id || c.currentJobId === j.id).length;
      return {
        id: j.id,
        title: j.title,
        client: j.client_name || '—',
        location: j.location || '—',
        rate: j.rate ? `$${j.rate}/hr` : '—',
        openings: j.openings ?? '—',
        status: j.status,
        candidates: candCount,
      };
    });
  }, [jobs]);

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'client', header: 'Client' },
    { key: 'location', header: 'Location' },
    { key: 'rate', header: 'Rate' },
    { key: 'openings', header: 'Openings' },
    { key: 'status', header: 'Status', render: (v) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{v}</span>
    )},
    { key: 'candidates', header: 'Candidates', render: (v) => (
      <span className="font-medium">{v}</span>
    )},
    { key: 'id', header: '', render: (_, row) => (
      <Link to={`/jobs/${row.id}/candidates`} className="text-blue-600 hover:underline text-xs font-medium">View Candidates</Link>
    )},
  ];

  if (jobs.length === 0) {
    return <div className="p-4"><Empty title="No jobs found" /></div>;
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Jobs</h1>
      <DataTable columns={columns} rows={rows} pageSize={10} />
    </div>
  );
}
