import React, { useState } from 'react';

export default function JobDetailsModal({ job, onClose }) {
  const [note, setNote] = useState('');

  const handleApply = () => {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications.push({
      jobId: job.id,
      userId: 'current-user', // In real app, get from auth
      note,
      timestamp: new Date().toISOString(),
      status: 'Applied'
    });
    localStorage.setItem('applications', JSON.stringify(applications));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">{job.title}</h2>
        <div className="mb-4">
          <p className="text-gray-600">{job.location} • {job.shift}</p>
          <p className="text-green-700 font-semibold">{job.pay}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Description</h3>
          <p>{job.description}</p>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Requirements</h3>
          <p>{job.requirements.map((req, i) => <li key={i}>{req}</li>)}</p> </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Add Note (Optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded p-2"
            rows="3"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
}