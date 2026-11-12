
/** 
 * @desc Dashboard for directors to monitor department performance
 * @author Replit Assistant
 * @since 2025-05-12
 */
import React from 'react';

export default function DirectorDashboard() {
  const metrics = {
    totalStaff: 85,
    utilization: "92%",
    revenue: "$4.2M",
    satisfaction: "4.8/5"
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Director Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Total Staff</h3>
          <p className="text-2xl font-bold">{metrics.totalStaff}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Utilization</h3>
          <p className="text-2xl font-bold">{metrics.utilization}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Revenue</h3>
          <p className="text-2xl font-bold">{metrics.revenue}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Satisfaction</h3>
          <p className="text-2xl font-bold">{metrics.satisfaction}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Department Goals</h2>
          <div className="space-y-4">
            {["Revenue Target", "Client Retention", "Team Growth"].map(goal => (
              <div key={goal} className="border-b pb-2">
                <div className="flex justify-between mb-1">
                  <span>{goal}</span>
                  <span className="font-semibold">{Math.floor(Math.random() * 20 + 80)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{width: `${Math.random() * 20 + 80}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600">Activity feed coming soon</p>
        </div>
      </div>
    </div>
  );
}
