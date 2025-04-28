
import React, { useState } from 'react';

export default function CandidateApprovals() {
  const [candidates, setCandidates] = useState([
    { id: 1, name: "John Smith", jobTitle: "Software Developer", submittedDate: "2024-03-15", status: "Pending" },
    { id: 2, name: "Emma Davis", jobTitle: "Project Manager", submittedDate: "2024-03-14", status: "Pending" },
    { id: 3, name: "Michael Brown", jobTitle: "Business Analyst", submittedDate: "2024-03-13", status: "Pending" }
  ]);

  const handleApprove = (id) => {
    setCandidates(candidates.map(candidate =>
      candidate.id === id ? { ...candidate, status: 'Approved' } : candidate
    ));
  };

  const handleReject = (id) => {
    setCandidates(candidates.map(candidate =>
      candidate.id === id ? { ...candidate, status: 'Rejected' } : candidate
    ));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Candidate Approvals</h1>
      
      <div className="bg-white rounded-lg shadow">
        {candidates.map(candidate => (
          <div key={candidate.id} className="border-b last:border-b-0 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{candidate.name}</h3>
                <p className="text-gray-600">{candidate.jobTitle}</p>
                <p className="text-sm text-gray-500">Submitted: {candidate.submittedDate}</p>
              </div>
              
              {candidate.status === 'Pending' ? (
                <div className="space-x-2">
                  <button
                    onClick={() => handleApprove(candidate.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(candidate.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <span className={`px-3 py-1 rounded-full text-sm ${
                  candidate.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {candidate.status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
