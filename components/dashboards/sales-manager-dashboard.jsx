
import React from 'react';

export default function SalesManagerDashboard() {
  const mockStats = {
    openJobs: 35,
    totalReps: 8,
    candidatesPipeline: 124
  };

  const mockReps = [
    { id: 1, name: 'John Smith', openJobs: 12, activeCandidates: 25, placementsThisMonth: 3 },
    { id: 2, name: 'Sarah Johnson', openJobs: 8, activeCandidates: 18, placementsThisMonth: 2 },
    { id: 3, name: 'Mike Wilson', openJobs: 15, activeCandidates: 31, placementsThisMonth: 4 }
  ];

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Open Jobs</h3>
          <p className="text-2xl font-bold text-blue-600">{mockStats.openJobs}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Reps Managed</h3>
          <p className="text-2xl font-bold text-green-600">{mockStats.totalReps}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Candidates in Pipeline</h3>
          <p className="text-2xl font-bold text-purple-600">{mockStats.candidatesPipeline}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rep Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Open Jobs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Candidates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placements This Month</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockReps.map(rep => (
              <tr key={rep.id}>
                <td className="px-6 py-4">{rep.name}</td>
                <td className="px-6 py-4">{rep.openJobs}</td>
                <td className="px-6 py-4">{rep.activeCandidates}</td>
                <td className="px-6 py-4">{rep.placementsThisMonth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
