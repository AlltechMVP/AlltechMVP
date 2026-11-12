
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MessageThread from '../common/MessageThread';
import { mockJobs } from '../../data/mockJobs';

export default function ApplicationReviewPanel() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const apps = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    setApplications(apps.filter(app => app.jobId === jobId));
  }, [jobId]);

  const updateStatus = (candidateId, newStatus) => {
    const updated = applications.map(app =>
      app.userId === candidateId ? {app, status: newStatus} : app
    );
    localStorage.setItem('appliedJobs', JSON.stringify(updated));
    setApplications(updated);
  };

  const addNote = (candidateId) => {
    const updated = applications.map(app =>
      app.userId === candidateId ? {
        app,
        recruiterNote: note,
        messages: [(app.messages || []), {
          from: 'recruiter',
          text: message,
          timestamp: new Date().toISOString()
        }]
      } : app
    );
    localStorage.setItem('appliedJobs', JSON.stringify(updated));
    setApplications(updated);
    setNote('');
    setMessage('');
  };

  const job = mockJobs.find(j => j.id === jobId);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">{job?.title} - Applications</h2>
      <p className="text-gray-600 mb-6">{job?.location}</p>

      <div className="space-y-4">
        {applications.map(app => (
          <div key={app.userId} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{app.userId}</h3>
                <span className={`inline-block px-2 py-1 rounded text-sm mt-2 
                  ${app.status === 'Hired' ? 'bg-green-100 text-green-800' :
                  app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'}`}>
                  {app.status}
                </span>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => updateStatus(app.userId, 'Interview Scheduled')}
                  className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  Schedule Interview
                </button>
                <button
                  onClick={() => updateStatus(app.userId, 'Hired')}
                  className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded hover:bg-green-50"
                >
                  Hire
                </button>
                <button
                  onClick={() => updateStatus(app.userId, 'Rejected')}
                  className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                >
                  Reject
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Internal Note
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to Candidate
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="2"
                />
              </div>
              <button
                onClick={() => addNote(app.userId)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save & Send
              </button>
            </div>

            <button 
              onClick={() => setSelectedApp(app)}
              className="mt-4 text-blue-600 hover:underline"
            >
              View Message History
            </button>
          </div>
        ))}
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Message History</h3>
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
