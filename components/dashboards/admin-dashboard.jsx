
import React, { useEffect, useState } from 'react';
import { loadJobOrders } from './jobOrders';
import { loadUsers } from './users';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    openJobs: 0,
    filledRoles: 0,
    candidates: 0,
    recruiters: 0
  });

  useEffect(() => {
    const jobs = loadJobOrders();
    const users = loadUsers();
    
    setMetrics({
      openJobs: jobs.filter(j => j.currentFilled < j.totalOpenings).length,
      filledRoles: jobs.reduce((acc, j) => acc + j.currentFilled, 0),
      candidates: jobs.reduce((acc, j) => acc + j.submittedCandidates.length, 0),
      recruiters: users.filter(u => u.role === 'recruiter').length
    });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Open Jobs</h3>
          <p className="text-2xl font-bold">{metrics.openJobs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Filled Roles</h3>
          <p className="text-2xl font-bold">{metrics.filledRoles}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Candidates</h3>
          <p className="text-2xl font-bold">{metrics.candidates}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500">Recruiters</h3>
          <p className="text-2xl font-bold">{metrics.recruiters}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create New Job Order
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
          Assign Recruiter
        </button>
        <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
          Export Snapshot to CSV
        </button>
      </div>
    </div>
  );
}
