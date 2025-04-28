
import React, { useState } from 'react';

export default function VMSAggregator() {
  const [isConnected, setIsConnected] = useState(false);
  
  const mockJobs = [
    { id: 1, title: 'Senior Developer', source: 'Fieldglass', status: 'Imported' },
    { id: 2, title: 'Project Manager', source: 'Beeline', status: 'Pending' },
    { id: 3, title: 'Business Analyst', source: 'SAP Ariba', status: 'Imported' },
    { id: 4, title: 'DevOps Engineer', source: 'Fieldglass', status: 'Pending' }
  ];

  const handleConnect = () => {
    setIsConnected(!isConnected);
    alert(isConnected ? 'Disconnected from VMS' : 'Connected to VMS');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">VMS Aggregator Simulation</h1>
      
      <button 
        onClick={handleConnect}
        className={`mb-8 px-4 py-2 rounded text-white ${
          isConnected ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isConnected ? 'Disconnect VMS Feed' : 'Connect to VMS Feed'}
      </button>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockJobs.map(job => (
              <tr key={job.id}>
                <td className="px-6 py-4">{job.title}</td>
                <td className="px-6 py-4">{job.source}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    job.status === 'Imported' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
