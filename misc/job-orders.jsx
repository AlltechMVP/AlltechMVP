
import React, { useState, useEffect } from 'react';

export default function JobOrders() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    title: '',
    location: '',
    payRate: '',
    billRate: ''
  });

  useEffect(() => {
    const storedJobs = JSON.parse(localStorage.getItem("mockJobs")) || [];
    setJobs(storedJobs);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedJobs = [...jobs, {
      ...newJob,
      payRate: parseFloat(newJob.payRate),
      billRate: parseFloat(newJob.billRate),
      matchedCandidates: []
    }];
    
    localStorage.setItem("mockJobs", JSON.stringify(updatedJobs));
    setJobs(updatedJobs);
    setNewJob({ title: '', location: '', payRate: '', billRate: '' });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Job Orders</h2>
      
      <div className="space-y-4 mb-8">
        {jobs.map((job, index) => (
          <div key={index} className="border border-gray-200 p-4 rounded-lg shadow-sm">
            <div className="font-semibold text-lg">{job.title}</div>
            <div className="text-gray-600">Location: {job.location}</div>
            <div className="text-gray-600">Pay Rate: ${job.payRate}/hr</div>
            <div className="text-gray-600">Bill Rate: ${job.billRate}/hr</div>
            <button 
              onClick={() => {
                localStorage.setItem("selectedJobIndex", index);
                window.location.href = "/match-candidates";
              }}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Match Candidates
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Add New Job</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Job Title</label>
            <input
              type="text"
              value={newJob.title}
              onChange={(e) => setNewJob({...newJob, title: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={newJob.location}
              onChange={(e) => setNewJob({...newJob, location: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Pay Rate ($/hr)</label>
            <input
              type="number"
              value={newJob.payRate}
              onChange={(e) => setNewJob({...newJob, payRate: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Bill Rate ($/hr)</label>
            <input
              type="number"
              value={newJob.billRate}
              onChange={(e) => setNewJob({...newJob, billRate: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <button 
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create Job
          </button>
        </form>
      </div>
    </div>
  );
}
