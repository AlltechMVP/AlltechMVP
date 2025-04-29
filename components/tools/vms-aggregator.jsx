
import React, { useState } from 'react';
import { loadJobOrders, tagJobWithVMS } from '../../src/data/jobOrders';

export default function VMSAggregator() {
  const [mockVMSJobs] = useState([
    {
      id: 'vms1',
      title: 'Senior Developer',
      source: 'Fieldglass',
      location: 'Chicago, IL',
      client: 'Enterprise Corp'
    },
    {
      id: 'vms2',
      title: 'Project Manager',
      source: 'Beeline',
      location: 'Remote',
      client: 'Tech Solutions Inc'
    },
    {
      id: 'vms3',
      title: 'Business Analyst',
      source: 'SAP Ariba',
      location: 'Boston, MA',
      client: 'Finance Co'
    }
  ]);

  const handleImport = (vmsJob) => {
    const jobs = loadJobOrders();
    const newJobId = Math.max(...jobs.map(j => j.id)) + 1;
    
    tagJobWithVMS(newJobId, {
      source: vmsJob.source,
      originalId: vmsJob.id
    });
    
    alert(`Job imported from ${vmsJob.source}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">VMS Job Aggregator</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockVMSJobs.map(job => (
              <tr key={job.id}>
                <td className="px-6 py-4">{job.title}</td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-1 rounded text-sm ${
                    job.source === 'Fieldglass' ? 'bg-blue-100 text-blue-800' :
                    job.source === 'Beeline' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {job.source}
                  </span>
                </td>
                <td className="px-6 py-4">{job.location}</td>
                <td className="px-6 py-4">{job.client}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleImport(job)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Import Job
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
