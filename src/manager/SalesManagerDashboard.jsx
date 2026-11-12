
/** 
 * @desc Dashboard for sales managers to track team performance
 * @author Replit Assistant
 * @since 2025-05-12
 */
import React from 'react';

export default function SalesManagerDashboard() {
  const salesMetrics = {
    monthlyTarget: "$500K",
    achieved: "$420K",
    pipeline: "$1.2M",
    meetings: 45,
    proposals: 12
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sales Manager Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Monthly Target</h3>
          <p className="text-2xl font-bold">{salesMetrics.monthlyTarget}</p>
          <span className="text-blue-500">{Math.round((420/500)*100)}% Achieved</span>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Pipeline Value</h3>
          <p className="text-2xl font-bold">{salesMetrics.pipeline}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Client Meetings</h3>
          <p className="text-2xl font-bold">{salesMetrics.meetings}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Team Performance</h2>
        <div className="space-y-4">
          {["John Smith", "Sarah Jones", "Mike Wilson"].map(rep => (
            <div key={rep} className="border-b pb-2">
              <div className="flex justify-between mb-1">
                <span>{rep}</span>
                <span className="font-semibold">${Math.floor(Math.random() * 100 + 100)}K</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{width: `${Math.random() * 40 + 60}%`}}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
