
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function FinanceReports() {
  const mockData = [
    {
      week: "2025-05-06",
      revenue: 11440,
      payroll: 7850,
      grossMargin: 3590,
      cashFlow: 3590
    },
    {
      week: "2025-05-13",
      revenue: 12100,
      payroll: 8200,
      grossMargin: 3900,
      cashFlow: 3900
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Financial Reports</h2>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Weekly P&L Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2">Week</th>
                <th className="px-4 py-2">Revenue</th>
                <th className="px-4 py-2">Payroll</th>
                <th className="px-4 py-2">Gross Margin</th>
                <th className="px-4 py-2">Cash Flow</th>
              </tr>
            </thead>
            <tbody>
              {mockData.map((week) => (
                <tr key={week.week}>
                  <td className="border px-4 py-2">{week.week}</td>
                  <td className="border px-4 py-2">${week.revenue}</td>
                  <td className="border px-4 py-2">${week.payroll}</td>
                  <td className="border px-4 py-2">${week.grossMargin}</td>
                  <td className="border px-4 py-2">${week.cashFlow}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Visual Breakdown</h3>
        <BarChart width={800} height={400} data={mockData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#4CAF50" />
          <Bar dataKey="payroll" fill="#f44336" />
          <Bar dataKey="grossMargin" fill="#2196F3" />
        </BarChart>
      </div>
    </div>
  );
}
