
import React from "react";

const SalesPipeline = () => {
  const pipeline = {
    "Discovery": 6,
    "Demo Scheduled": 4, 
    "Proposal Sent": 3,
    "Contract Out": 1,
    "Closed Won": 2,
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {Object.entries(pipeline).map(([stage, count]) => (
        <div key={stage} className="border p-4 rounded shadow bg-white">
          <h2 className="text-lg font-semibold">{stage}</h2>
          <p className="text-3xl font-bold mt-2">{count}</p>
        </div>
      ))}
    </div>
  );
};

export default SalesPipeline;
