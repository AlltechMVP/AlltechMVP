
import React from 'react';

export default function SalesRepDashboard() {
  const mockStats = {
    activeJobs: 12,
    submittedCandidates: 45,
    placementsMade: 8
  };

  const mockJobs = [
    { id: 1, title: 'Senior Developer', location: 'Remote', status: 'Active', candidates: 5 },
    { id: 2, title: 'Project Manager', location: 'New York', status: 'Pending', candidates: 3 },
    { id: 3, title: 'Business Analyst', location: 'Chicago', status: 'Active', candidates: 7 }
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Active Jobs</h3>
          <p className="text-2xl font-bold text-blue-600">{mockStats.activeJobs}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Submitted Candidates</h3>
          <p className="text-2xl font-bold text-green-600">{mockStats.submittedCandidates}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Placements Made</h3>
          <p className="text-2xl font-bold text-purple-600">{mockStats.placementsMade}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidates</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockJobs.map(job => (
              <tr key={job.id}>
                <td className="px-6 py-4">{job.title}</td>
                <td className="px-6 py-4">{job.location}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4">{job.candidates}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
