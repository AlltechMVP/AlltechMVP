
import React, { useState, useEffect } from 'react';
import { loadJobOrders, approveJobByClient, rejectJobByClient } from './jobOrders';

export default function ClientApprovals() {
  const [pendingJobs, setPendingJobs] = useState([]);

  useEffect(() => {
    const jobs = loadJobOrders();
    setPendingJobs(jobs.filter(job => job.clientApprovalStatus === 'pending'));
  }, []);

  const handleApprove = (id) => {
    const feedback = window.prompt('Enter approval feedback:');
    if (feedback) {
      approveJobByClient(id, feedback);
      setPendingJobs(prevJobs => prevJobs.filter(job => job.id !== id));
    }
  };

  const handleReject = (id) => {
    const feedback = window.prompt('Enter rejection reason:');
    if (feedback) {
      rejectJobByClient(id, feedback);
      setPendingJobs(prevJobs => prevJobs.filter(job => job.id !== id));
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Pending Job Approvals</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingJobs.map(job => (
          <div key={job.id} className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
            <p className="text-gray-600 mb-2">{job.client}</p>
            <p className="text-gray-700 mb-4">{job.description}</p>
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => handleApprove(job.id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Approve
              </button>
              <button 
                onClick={() => handleReject(job.id)}
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
