
import React from 'react';

export default function ClientDashboard() {
  // Mock data
  const clientData = {
    name: "Acme Corporation",
    stats: {
      activeAssignments: 12,
      pendingApprovals: 3,
      openJobOrders: 5
    },
    assignments: [
      { id: 1, name: "Software Developer", candidate: "John Smith", status: "Active" },
      { id: 2, name: "Project Manager", candidate: "Sarah Wilson", status: "Active" },
      { id: 3, name: "Business Analyst", candidate: "Mike Johnson", status: "Pending Approval" },
      { id: 4, name: "UX Designer", candidate: "Emily Brown", status: "Active" }
    ]
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {clientData.name}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Assignments</h3>
          <p className="text-2xl font-bold text-blue-600">{clientData.stats.activeAssignments}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Pending Approvals</h3>
          <p className="text-2xl font-bold text-orange-600">{clientData.stats.pendingApprovals}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Open Job Orders</h3>
          <p className="text-2xl font-bold text-green-600">{clientData.stats.openJobOrders}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clientData.assignments.map(assignment => (
              <tr key={assignment.id}>
                <td className="px-6 py-4">{assignment.name}</td>
                <td className="px-6 py-4">{assignment.candidate}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    assignment.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {assignment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
