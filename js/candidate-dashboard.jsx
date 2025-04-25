
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadCandidates, updateCandidate } from './data-store';

export default function CandidateDashboard() {
  const [candidate, setCandidate] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load candidate ID 1 for MVP
    const candidates = loadCandidates();
    const candidate = candidates.find(c => c.id === 1);
    setCandidate(candidate);
  }, []);

  if (!candidate) return <div>Loading...</div>;

  const progress = (candidate.onboardingStep / candidate.totalSteps) * 100;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{candidate.name}</h1>
        
        <div className="space-y-4">
          <div>
            <label className="text-gray-600">Job Applied For</label>
            <p className="font-medium">{candidate.job}</p>
          </div>

          <div>
            <label className="text-gray-600">Application Status</label>
            <p className="font-medium">{candidate.status}</p>
          </div>

          <div>
            <label className="text-gray-600">Onboarding Progress</label>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Step {candidate.onboardingStep} of {candidate.totalSteps}
            </p>
          </div>

          <button
            onClick={() => navigate('/onboarding-flow')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Continue Onboarding
          </button>
        </div>
      </div>
    </div>
  );
}
