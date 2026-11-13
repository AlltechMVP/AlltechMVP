import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getJobsForClient, getClientById,
  getTimesheetsForClient, getSubmittedCandidatesForJob
} from '@/utils/storage';
import { useDemoClientId } from '@/lib/useDemoClientId';

export default function ClientDashboard() {
  const [client, setClient] = useState(null);
  const [stats, setStats] = useState({ jobs: 0, pendingCandidates: 0, pendingTimecards: 0 });
  const demoClientId = useDemoClientId();

  useEffect(() => {
    const clientId = demoClientId;
    const cl = getClientById(clientId);
    setClient(cl);

    const jobs = getJobsForClient(clientId);
    let pendingCandidates = 0;
    jobs.forEach(j => {
      const subs = getSubmittedCandidatesForJob(j.id);
      pendingCandidates += subs.filter(c => !c.clientDecision).length;
    });

    const timesheets = getTimesheetsForClient(clientId);
    const pendingTimecards = timesheets.filter(t => (t.clientApprovalStatus || 'Not Submitted') === 'Submitted').length;

    setStats({ jobs: jobs.length, pendingCandidates, pendingTimecards });
  }, [demoClientId]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Client Portal</h1>
      {client && <p className="text-gray-500 mb-6">Welcome, {client.contactPerson} &middot; {client.name}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/client/jobs" className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition">
          <div className="text-3xl font-bold text-blue-600 mb-1">{stats.jobs}</div>
          <h3 className="text-sm font-semibold text-gray-700">Active Jobs</h3>
          <p className="text-xs text-gray-500 mt-1">View and manage your job orders</p>
        </Link>

        <Link to="/client/jobs" className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition">
          <div className="text-3xl font-bold text-amber-600 mb-1">{stats.pendingCandidates}</div>
          <h3 className="text-sm font-semibold text-gray-700">Candidates Pending Review</h3>
          <p className="text-xs text-gray-500 mt-1">Approve or reject submitted candidates</p>
        </Link>

        <Link to="/client/timecards" className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition">
          <div className="text-3xl font-bold text-purple-600 mb-1">{stats.pendingTimecards}</div>
          <h3 className="text-sm font-semibold text-gray-700">Timecards Pending Approval</h3>
          <p className="text-xs text-gray-500 mt-1">Review and approve submitted timecards</p>
        </Link>
      </div>

      {(stats.pendingCandidates > 0 || stats.pendingTimecards > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 mb-1">Action Required</h3>
          <p className="text-sm text-amber-700">
            You have {stats.pendingCandidates > 0 ? `${stats.pendingCandidates} candidate(s)` : ''}
            {stats.pendingCandidates > 0 && stats.pendingTimecards > 0 ? ' and ' : ''}
            {stats.pendingTimecards > 0 ? `${stats.pendingTimecards} timecard(s)` : ''}
            {' '}awaiting your review.
          </p>
        </div>
      )}
    </div>
  );
}
