
import React, { useState, useEffect } from 'react';

export default function ApprovalWorkflow() {
  const [candidates, setCandidates] = useState([]);
  const [approvalLogs, setApprovalLogs] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('mockApprovalLogs') || '[]');
    setApprovalLogs(stored);
    // Mock candidates data
    setCandidates([
      { id: 'cand123', name: 'John Doe', position: 'Warehouse Worker', status: 'Pending' },
      { id: 'cand124', name: 'Jane Smith', position: 'Forklift Operator', status: 'Pending' }
    ]);
  }, []);

  const handleApproval = (candidateId, approved, message = '') => {
    const log = {
      candidateId,
      clientId: 'client456',
      jobId: 'job001',
      status: approved ? 'Approved' : 'Rejected',
      message,
      timestamp: new Date().toISOString()
    };

    const updated = [approvalLogs, log];
    localStorage.setItem('mockApprovalLogs', JSON.stringify(updated));
    setApprovalLogs(updated);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Candidate Approvals</h2>
      <div className="space-y-4">
        {candidates.map(candidate => (
          <div key={candidate.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{candidate.name}</h3>
            <p className="text-gray-600">{candidate.position}</p>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => handleApproval(candidate.id, true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleApproval(candidate.id, false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
