
import React, { useState, useEffect } from 'react';

export default function ClientReviewDashboard() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const storedCandidates = JSON.parse(localStorage.getItem("mockCandidates")) || [];
    setCandidates(storedCandidates);
  }, []);

  const approve = (index) => {
    const updatedCandidates = [...candidates];
    updatedCandidates[index].clientStatus = "Approved";
    saveAndRender(updatedCandidates);
  };

  const reject = (index) => {
    const updatedCandidates = [...candidates];
    updatedCandidates[index].clientStatus = "Rejected";
    saveAndRender(updatedCandidates);
  };

  const saveAndRender = (updatedCandidates) => {
    localStorage.setItem("mockCandidates", JSON.stringify(updatedCandidates));
    setCandidates(updatedCandidates);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Client Candidate Review</h2>
      <div className="space-y-4">
        {candidates.filter(c => c.ready).map((c, index) => (
          <div key={index} className="border border-gray-200 p-4 rounded-lg shadow-sm">
            <div className="font-semibold text-lg">{c.name}</div>
            <div className="text-gray-600">Email: {c.email}</div>
            <div className="text-gray-600">Job: {c.job}</div>
            <div className="text-gray-600">Resume: {c.resume}</div>
            {c.clientStatus && (
              <div className={`text-${c.clientStatus === 'Approved' ? 'green' : 'red'}-600 font-semibold`}>
                Status: {c.clientStatus}
              </div>
            )}
            <div className="mt-4 space-x-2">
              <button 
                onClick={() => approve(index)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Approve
              </button>
              <button 
                onClick={() => reject(index)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
