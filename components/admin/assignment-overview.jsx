
import React from 'react';

export default function AssignmentOverview() {
  const mockStats = {
    totalActive: 45,
    pendingStarts: 12,
    endedThisMonth: 8
  };

  const mockAssignments = [
    { id: 1, candidate: "John Smith", jobTitle: "Software Developer", client: "TechCorp", startDate: "2024-01-15", endDate: "2024-07-15", status: "Active" },
    { id: 2, candidate: "Sarah Wilson", jobTitle: "Project Manager", client: "ConsultCo", startDate: "2024-02-01", endDate: "2024-08-01", status: "Active" },
    { id: 3, candidate: "Mike Johnson", jobTitle: "Business Analyst", client: "FinanceInc", startDate: "2024-03-01", endDate: null, status: "Pending Start" },
    { id: 4, candidate: "Emily Brown", jobTitle: "Data Scientist", client: "DataTech", startDate: "2023-09-15", endDate: "2024-02-15", status: "Ended" },
    { id: 5, candidate: "Chris Davis", jobTitle: "DevOps Engineer", client: "CloudSys", startDate: "2024-01-01", endDate: "2024-06-30", status: "Active" }
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Assignment Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Active Assignments</h3>
          <p className="text-2xl font-bold text-blue-600">{mockStats.totalActive}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Pending Starts</h3>
          <p className="text-2xl font-bold text-yellow-600">{mockStats.pendingStarts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Ended This Month</h3>
          <p className="text-2xl font-bold text-gray-600">{mockStats.endedThisMonth}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Candidate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockAssignments.map(assignment => (
              <tr key={assignment.id}>
                <td className="px-6 py-4">{assignment.candidate}</td>
                <td className="px-6 py-4">{assignment.jobTitle}</td>
                <td className="px-6 py-4">{assignment.client}</td>
                <td className="px-6 py-4">{assignment.startDate}</td>
                <td className="px-6 py-4">{assignment.endDate || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    assignment.status === 'Active' ? 'bg-green-100 text-green-800' :
                    assignment.status === 'Pending Start' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
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
