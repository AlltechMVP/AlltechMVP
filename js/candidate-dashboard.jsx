
import React, { useState, useEffect } from 'react';
import { loadCandidates, updateCandidate } from './data-store';

export default function CandidateDashboard() {
  const [candidate, setCandidate] = useState(null);
  
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const candidates = loadCandidates();
    const userCandidate = candidates.find(c => c.email === currentUser.email);
    setCandidate(userCandidate);
  }, []);

  if (!candidate) return <div>Loading...</div>;

  const progressPercent = (candidate.onboardingStep / 5) * 100;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Candidate Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Application Status</h2>
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Onboarding Progress: {progressPercent}%</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-medium">{candidate.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Job Applied For</p>
            <p className="font-medium">Job #{candidate.jobId}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Updates</h2>
        {candidate.notes.map((note, index) => (
          <div key={index} className="border-b last:border-0 py-3">
            <p className="text-gray-800">{note.text}</p>
            <p className="text-sm text-gray-500">{new Date(note.timestamp).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
