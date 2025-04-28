
import React from 'react';

export default function RevenueOverview() {
  const mockStats = {
    totalRevenue: 450000,
    totalPayroll: 320000,
    netProfit: 130000
  };

  const mockMonthlyData = [
    { month: 'January', revenue: 450000, expenses: 320000 },
    { month: 'February', revenue: 480000, expenses: 350000 },
    { month: 'March', revenue: 520000, expenses: 380000 }
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Revenue Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">
            ${mockStats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Payroll</h3>
          <p className="text-2xl font-bold text-red-600">
            ${mockStats.totalPayroll.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Net Profit</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${mockStats.netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Revenue vs Expenses</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expenses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockMonthlyData.map((data, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">{data.month}</td>
                  <td className="px-6 py-4 text-green-600">${data.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-red-600">${data.expenses.toLocaleString()}</td>
                  <td className="px-6 py-4 text-blue-600">
                    ${(data.revenue - data.expenses).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
