
import React from 'react';

export default function BranchManagerDashboard() {
  const mockStats = {
    activeJobs: 45,
    activeCandidates: 128,
    totalPlacements: 24
  };

  const mockJobs = [
    { id: 1, title: 'Senior Developer', location: 'Chicago, IL', candidatesAssigned: 5, openings: 3 },
    { id: 2, title: 'Project Manager', location: 'New York, NY', candidatesAssigned: 4, openings: 2 },
    { id: 3, title: 'Business Analyst', location: 'Austin, TX', candidatesAssigned: 3, openings: 1 },
    { id: 4, title: 'DevOps Engineer', location: 'Remote', candidatesAssigned: 6, openings: 4 }
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Branch Manager Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Active Jobs</h3>
          <p className="text-2xl font-bold text-blue-600">{mockStats.activeJobs}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Active Candidates</h3>
          <p className="text-2xl font-bold text-green-600">{mockStats.activeCandidates}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Placements</h3>
          <p className="text-2xl font-bold text-purple-600">{mockStats.totalPlacements}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidates Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Openings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockJobs.map(job => (
              <tr key={job.id}>
                <td className="px-6 py-4">{job.title}</td>
                <td className="px-6 py-4">{job.location}</td>
                <td className="px-6 py-4">{job.candidatesAssigned}</td>
                <td className="px-6 py-4">{job.openings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
