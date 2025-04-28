
import React from 'react';

export default function CFODashboard() {
  const mockStats = {
    totalRevenue: '$3.2M',
    totalPayroll: '$2.1M',
    netProfit: '$1.1M'
  };

  const mockClients = [
    { id: 1, name: 'TechCorp Inc', totalBilled: '$450K', totalPaid: '$400K', outstanding: '$50K' },
    { id: 2, name: 'Manufacturing Pro', totalBilled: '$320K', totalPaid: '$320K', outstanding: '$0' },
    { id: 3, name: 'Healthcare Plus', totalBilled: '$280K', totalPaid: '$200K', outstanding: '$80K' },
    { id: 4, name: 'Logistics Hub', totalBilled: '$175K', totalPaid: '$150K', outstanding: '$25K' }
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">CFO Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Revenue This Month</h3>
          <p className="text-2xl font-bold text-blue-600">{mockStats.totalRevenue}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Payroll Expenses</h3>
          <p className="text-2xl font-bold text-red-600">{mockStats.totalPayroll}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Net Profit</h3>
          <p className="text-2xl font-bold text-green-600">{mockStats.netProfit}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Billed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockClients.map(client => (
              <tr key={client.id}>
                <td className="px-6 py-4">{client.name}</td>
                <td className="px-6 py-4">{client.totalBilled}</td>
                <td className="px-6 py-4">{client.totalPaid}</td>
                <td className="px-6 py-4">{client.outstanding}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
