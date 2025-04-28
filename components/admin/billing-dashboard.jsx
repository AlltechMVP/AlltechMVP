
import React from 'react';

export default function BillingDashboard() {
  const mockStats = {
    totalInvoices: '$145,000',
    totalPaid: '$98,500',
    outstanding: '$46,500'
  };

  const mockInvoices = [
    { id: 'INV-2024-001', client: 'TechCorp Inc', amount: '$28,500', status: 'Paid', dueDate: '2024-03-15' },
    { id: 'INV-2024-002', client: 'Manufacturing Pro', amount: '$15,750', status: 'Unpaid', dueDate: '2024-03-20' },
    { id: 'INV-2024-003', client: 'Healthcare Plus', amount: '$32,000', status: 'Paid', dueDate: '2024-03-10' },
    { id: 'INV-2024-004', client: 'Logistics Hub', amount: '$19,250', status: 'Unpaid', dueDate: '2024-03-25' },
    { id: 'INV-2024-005', client: 'Retail Giants', amount: '$24,500', status: 'Paid', dueDate: '2024-03-12' },
    { id: 'INV-2024-006', client: 'StartUp Co', amount: '$12,750', status: 'Unpaid', dueDate: '2024-03-28' },
    { id: 'INV-2024-007', client: 'Global Services', amount: '$22,250', status: 'Paid', dueDate: '2024-03-15' }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Billing Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Invoices This Month</h3>
          <p className="text-2xl font-bold text-blue-600">{mockStats.totalInvoices}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Paid</h3>
          <p className="text-2xl font-bold text-green-600">{mockStats.totalPaid}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Outstanding Balance</h3>
          <p className="text-2xl font-bold text-red-600">{mockStats.outstanding}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockInvoices.map(invoice => (
              <tr key={invoice.id}>
                <td className="px-6 py-4">{invoice.id}</td>
                <td className="px-6 py-4">{invoice.client}</td>
                <td className="px-6 py-4">{invoice.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    invoice.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4">{invoice.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
