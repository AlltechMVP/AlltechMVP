
import React, { useState } from "react";

export default function ROICalculator() {
  const [currentCost, setCurrentCost] = useState("");
  const [newCost, setNewCost] = useState("");
  const [results, setResults] = useState(null);

  const calculateSavings = () => {
    const current = parseFloat(currentCost);
    const newAmount = parseFloat(newCost);
    
    if (isNaN(current) || isNaN(newAmount)) return;
    
    const weeklySavings = current - newAmount;
    const annualSavings = weeklySavings * 52;
    const percentSaved = (weeklySavings / current) * 100;
    
    setResults({ weeklySavings, annualSavings, percentSaved });
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ROI Calculator</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-1">Current Weekly Cost ($)</label>
          <input
            type="number"
            value={currentCost}
            onChange={(e) => setCurrentCost(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1">New Weekly Cost ($)</label>
          <input
            type="number"
            value={newCost}
            onChange={(e) => setNewCost(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          onClick={calculateSavings}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Calculate Savings
        </button>

        {results && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Weekly Savings</p>
                <p className="text-xl font-bold">${results.weeklySavings.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Annual Savings</p>
                <p className="text-xl font-bold">${results.annualSavings.toFixed(2)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Cost Reduction</p>
                <p className="text-xl font-bold">{results.percentSaved.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
