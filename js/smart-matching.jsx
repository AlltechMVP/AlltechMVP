
import React, { useState, useEffect } from "react";
import { loadJobOrders } from "./jobOrders";

export default function SmartMatching() {
  const [keyword, setKeyword] = useState("");
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    if (!keyword) return setMatches([]);
    const jobs = loadJobOrders();
    const searchTerm = keyword.toLowerCase();
    setMatches(
      jobs.filter(job => 
        job.title.toLowerCase().includes(searchTerm) || 
        job.description?.toLowerCase().includes(searchTerm)
      )
    );
  }, [keyword]);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Smart Job Matching</h1>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Enter skills or keywords..."
        className="w-full p-3 border rounded mb-6"
      />
      
      <div className="space-y-4">
        {matches.map(job => (
          <div key={job.id} className="border rounded-lg p-4">
            <h3 className="font-bold">{job.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{job.client}</p>
            <p className="mt-2">{job.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
