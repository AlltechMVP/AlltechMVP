
import React, { useState, useEffect } from 'react';
import MessageThread from '../common/MessageThread';
import { mockJobs } from '../../data/mockJobs';

export default function ApplicationTracker() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const storedApps = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    setApplications(storedApps);
  }, []);

  const withdrawApplication = (appId) => {
    const updated = applications.map(app => 
      app.jobId === appId ? {app, status: 'Withdrawn'} : app
    );
    localStorage.setItem('appliedJobs', JSON.stringify(updated));
    setApplications(updated);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">My Applications</h2>
      <div className="grid gap-4">
        {applications.map(app => {
          const job = mockJobs.find(j => j.id === app.jobId);
          return (
            <div key={app.jobId} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{job?.title}</h3>
                  <p className="text-gray-600">{job?.location}</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm mt-2 
                    ${app.status === 'Hired' ? 'bg-green-100 text-green-800' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'}`}>
                    {app.status}
                  </span>
                </div>
                <div className="space-x-2">
                  {app.status === 'Applied' && (
                    <button 
                      onClick={() => withdrawApplication(app.jobId)}
                      className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                    >
                      Withdraw
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedApp(app)}
                    className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                  >
                    View Messages
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Messages</h3>
              <button 
                onClick={() => setSelectedApp(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <MessageThread 
              messages={selectedApp.messages || []}
              applicationId={selectedApp.jobId}
            />
          </div>
        </div>
      )}
    </div>
  );
}
