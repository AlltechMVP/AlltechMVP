
import React, { useEffect, useState } from 'react';
import { loadJobOrders } from './jobOrders';
import { loadSalesData } from './salesData';

export default function ExecutiveDashboard() {
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    filled: 0,
    winRate: 0,
    pipeline: {
      lead: 0,
      demo: 0,
      proposal: 0,
      closed: 0
    }
  });

  useEffect(() => {
    const jobs = loadJobOrders();
    const sales = loadSalesData();

    const totalFilled = jobs.reduce((acc, job) => acc + job.currentFilled, 0);
    const totalPositions = jobs.reduce((acc, job) => acc + job.totalOpenings, 0);

    const pipelineCount = sales.reduce((acc, contact) => {
      acc[contact.stage.toLowerCase()] = (acc[contact.stage.toLowerCase()] || 0) + 1;
      return acc;
    }, {});

    const closedWon = sales.filter(s => s.stage === 'Closed').length;
    const winRate = (closedWon / sales.length) * 100;

    setMetrics({
      totalJobs: jobs.length,
      filled: totalFilled,
      winRate: Math.round(winRate),
      pipeline: pipelineCount
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Executive Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Jobs</h3>
          <p className="text-3xl font-bold">{metrics.totalJobs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Positions Filled</h3>
          <p className="text-3xl font-bold">{metrics.filled}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Win Rate</h3>
          <p className="text-3xl font-bold">{metrics.winRate}%</p>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Pipeline Breakdown</h2>
        <div className="space-y-3">
          {Object.entries(metrics.pipeline).map(([stage, count]) => (
            <div key={stage} className="relative">
              <div className="text-sm text-gray-600 mb-1 capitalize">
                {stage} ({count})
              </div>
              <div className="h-4 bg-gray-200 rounded">
                <div
                  className="h-full bg-blue-500 rounded"
                  style={{
                    width: `${(count / Object.values(metrics.pipeline).reduce((a, b) => a + b, 0)) * 100}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
