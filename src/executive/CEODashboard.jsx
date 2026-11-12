
/** 
 * @desc Executive dashboard for CEO with company-wide KPIs
 * @author Replit Assistant
 * @since 2025-05-12
 */
import React from 'react';

export default function CEODashboard() {
  const metrics = {
    revenue: "$12.5M",
    growth: "+15%",
    activeClients: 245,
    placementRate: "87%",
    avgTimeToFill: "12 days",
    clientSatisfaction: "94%"
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Executive Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Revenue (YTD)</h3>
          <p className="text-2xl font-bold">{metrics.revenue}</p>
          <span className="text-green-500">{metrics.growth} YoY</span>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Active Clients</h3>
          <p className="text-2xl font-bold">{metrics.activeClients}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Placement Rate</h3>
          <p className="text-2xl font-bold">{metrics.placementRate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Branch Performance</h2>
          <div className="space-y-4">
            {["West", "East", "Central", "South"].map(region => (
              <div key={region} className="flex justify-between">
                <span>{region}</span>
                <span className="font-semibold">${Math.floor(Math.random() * 2 + 2)}M</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Avg Time to Fill</span>
              <span className="font-semibold">{metrics.avgTimeToFill}</span>
            </div>
            <div className="flex justify-between">
              <span>Client Satisfaction</span>
              <span className="font-semibold">{metrics.clientSatisfaction}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

