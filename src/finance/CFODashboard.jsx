
/** 
 * @desc Financial dashboard for CFO with revenue and cost metrics
 * @author Replit Assistant
 * @since 2025-05-12
 */
import React from 'react';

export default function CFODashboard() {
  const financials = {
    revenue: "$12.5M",
    costs: "$8.2M",
    margin: "34.4%",
    ar: "$2.1M",
    dso: "42 days",
    cashBalance: "$3.4M"
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Financial Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Revenue</h3>
          <p className="text-2xl font-bold">{financials.revenue}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Operating Costs</h3>
          <p className="text-2xl font-bold">{financials.costs}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-gray-500 text-sm">Gross Margin</h3>
          <p className="text-2xl font-bold">{financials.margin}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Accounts Receivable</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total AR</span>
              <span className="font-semibold">{financials.ar}</span>
            </div>
            <div className="flex justify-between">
              <span>DSO</span>
              <span className="font-semibold">{financials.dso}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Cash Position</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Cash Balance</span>
              <span className="font-semibold">{financials.cashBalance}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
