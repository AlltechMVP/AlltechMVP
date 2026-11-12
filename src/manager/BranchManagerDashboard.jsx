
/** 
 * @desc Dashboard for branch managers with location-specific metrics
 * @author Replit Assistant
 * @since 2025-05-12
 */
import React from 'react';

export default function BranchManagerDashboard() {
  const branchMetrics = {
    activeAssignments: 125,
    openReqs: 45,
    revenue: "$850K",
    margin: "32%"
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Branch Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Active Assignments</h3>
          <p className="text-2xl font-bold">{branchMetrics.activeAssignments}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Open Requirements</h3>
          <p className="text-2xl font-bold">{branchMetrics.openReqs}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Clients</h2>
          <div className="space-y-4">
            {["Acme Corp", "TechCo", "Manufacturing Inc"].map(client => (
              <div key={client} className="flex justify-between">
                <span>{client}</span>
                <span className="font-semibold">${Math.floor(Math.random() * 100 + 50)}K</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Branch Performance</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Revenue</span>
              <span className="font-semibold">{branchMetrics.revenue}</span>
            </div>
            <div className="flex justify-between">
              <span>Margin</span>
              <span className="font-semibold">{branchMetrics.margin}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
