
import React, { useState, useEffect } from 'react';
import { loadJobOrders } from './jobOrders';

export default function ExecutiveDashboard() {
  const [kpis, setKpis] = useState({
    placements: 0,
    avgTimeToFill: 0,
    winRate: 0,
    grossMargin: 0
  });

  useEffect(() => {
    const jobs = loadJobOrders();
    
    // Mock calculations
    setKpis({
      placements: jobs.reduce((acc, job) => acc + job.currentFilled, 0),
      avgTimeToFill: 14.5, // Mock days
      winRate: 68, // Mock percentage
      grossMargin: 4200 // Mock dollars per job
    });
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Executive Dashboard</h1>
        <div className="space-x-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Export Report
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Print View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 mb-2">Placements This Month</h3>
          <p className="text-3xl font-bold">{kpis.placements}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 mb-2">Avg Time to Fill</h3>
          <p className="text-3xl font-bold">{kpis.avgTimeToFill} days</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 mb-2">Sales Win Rate</h3>
          <p className="text-3xl font-bold">{kpis.winRate}%</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 mb-2">Gross Margin/Job</h3>
          <p className="text-3xl font-bold">${kpis.grossMargin}</p>
        </div>
      </div>
    </div>
  );
}
