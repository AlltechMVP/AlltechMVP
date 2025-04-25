
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadJobOrders, markJobFilled, updateJobOrder } from './jobOrders';

export default function JobOrders() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const jobData = loadJobOrders();
    setJobs(jobData);
  }, []);

  const handleMarkFilled = (jobId) => {
    const updatedJobs = markJobFilled(jobId);
    setJobs(updatedJobs);
  };

  const assignRecruiter = (jobId) => {
    const updatedJobs = updateJobOrder(jobId, {
      recruiterIds: [1]
    });
    setJobs(updatedJobs);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Job Orders</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map(job => (
          <div key={job.id} className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <p className="text-gray-600">{job.location}</p>
            <p className="font-medium">${job.payRate}/hr</p>
            <p className="text-gray-700">{job.client}</p>
            <div className="flex items-center gap-2 my-2">
              <span className={`px-2 py-1 rounded text-sm ${
                job.urgency === 'High' ? 'bg-red-100 text-red-800' : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {job.urgency} Urgency
              </span>
              <span className="text-sm text-gray-600">
                {job.currentFilled} of {job.totalOpenings} filled
              </span>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => navigate(`/job-details/${job.id}`)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View Details
              </button>
              <button
                onClick={() => handleMarkFilled(job.id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Mark as Filled
              </button>
              <button
                onClick={() => assignRecruiter(job.id)}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Assign Recruiter
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
