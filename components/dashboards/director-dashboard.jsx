
import React from 'react';

export default function DirectorDashboard() {
  const mockStats = {
    totalBranches: 12,
    activeClients: 156,
    revenueThisMonth: '$2.4M'
  };

  const mockBranches = [
    { id: 1, name: 'Chicago HQ', activeJobs: 45, activeClients: 28, monthlyRevenue: '$850K' },
    { id: 2, name: 'NYC Branch', activeJobs: 38, activeClients: 32, monthlyRevenue: '$720K' },
    { id: 3, name: 'Austin Office', activeJobs: 29, activeClients: 24, monthlyRevenue: '$480K' },
    { id: 4, name: 'SF Bay Area', activeJobs: 42, activeClients: 35, monthlyRevenue: '$650K' }
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Director Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Branches</h3>
          <p className="text-2xl font-bold text-blue-600">{mockStats.totalBranches}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Active Clients</h3>
          <p className="text-2xl font-bold text-green-600">{mockStats.activeClients}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Revenue This Month</h3>
          <p className="text-2xl font-bold text-purple-600">{mockStats.revenueThisMonth}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Jobs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Clients</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockBranches.map(branch => (
              <tr key={branch.id}>
                <td className="px-6 py-4">{branch.name}</td>
                <td className="px-6 py-4">{branch.activeJobs}</td>
                <td className="px-6 py-4">{branch.activeClients}</td>
                <td className="px-6 py-4">{branch.monthlyRevenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
