
import React from 'react';

export default function CEODashboard() {
  const mockStats = {
    revenueYTD: '$28.5M',
    placementsYTD: 842,
    activeClients: 156
  };

  const mockBranches = [
    { id: 1, name: 'New York HQ', revenueYTD: '$8.2M', placementsYTD: 245, activeClients: 48 },
    { id: 2, name: 'Chicago Branch', revenueYTD: '$6.4M', placementsYTD: 198, activeClients: 42 },
    { id: 3, name: 'LA Office', revenueYTD: '$7.8M', placementsYTD: 224, activeClients: 38 },
    { id: 4, name: 'Miami Division', revenueYTD: '$6.1M', placementsYTD: 175, activeClients: 28 }
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">CEO Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Revenue YTD</h3>
          <p className="text-2xl font-bold text-blue-600">{mockStats.revenueYTD}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Placements YTD</h3>
          <p className="text-2xl font-bold text-green-600">{mockStats.placementsYTD}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Active Clients</h3>
          <p className="text-2xl font-bold text-purple-600">{mockStats.activeClients}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue YTD</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placements YTD</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Clients</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockBranches.map(branch => (
              <tr key={branch.id}>
                <td className="px-6 py-4">{branch.name}</td>
                <td className="px-6 py-4">{branch.revenueYTD}</td>
                <td className="px-6 py-4">{branch.placementsYTD}</td>
                <td className="px-6 py-4">{branch.activeClients}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
