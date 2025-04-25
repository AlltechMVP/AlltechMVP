// data-store.js
const updateOnboardingData = (id, updates) => {
  const candidate = getCandidate(id);
  candidate.onboardingData = { ...candidate.onboardingData, ...updates };
  localStorage.setItem('candidates', JSON.stringify([candidate]));
};

const updateCandidate = (id, updates) => {
  const candidate = getCandidate(id);
  const updatedCandidate = { ...candidate, ...updates };
  localStorage.setItem('candidates', JSON.stringify([updatedCandidate]));
};

const getCandidate = (id) => {
  const candidates = JSON.parse(localStorage.getItem('candidates')) || [];
  return candidates.find((candidate) => candidate.id === id) || { id, onboardingData: {}, onboardingStep: 1, status: 'Submitted' };
};

export { updateOnboardingData, updateCandidate, getCandidate };


// candidate-dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCandidate } from './data-store';

function CandidateDashboard() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState({});

  useEffect(() => {
    const candidateData = getCandidate(1); // Assuming candidate ID 1 for now
    setCandidate(candidateData);
  }, []);

  const totalSteps = 5;
  const progress = Math.round((candidate.onboardingStep / totalSteps) * 100);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Candidate Dashboard</h1>
      <div className="bg-gray-200 rounded-lg p-6 mb-4">
        <p>Name: {candidate.name || 'N/A'}</p>
        <p>Job Applied For: {candidate.jobAppliedFor || 'N/A'}</p>
        <p>Current Onboarding Step: {candidate.onboardingStep || 1}</p>
        <p>Application Status: {candidate.status || 'Submitted'}</p>
        <div className="bg-blue-100 rounded-full h-4 w-full mt-4">
          <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress}%` }}>
          </div>
        </div>
        <p className="mt-2">Progress: {progress}%</p>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => navigate('/onboarding-flow')}
      >
        Continue Onboarding
      </button>
    </div>
  );
}

export default CandidateDashboard;


// onboarding-flow.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateOnboardingData, updateCandidate, getCandidate } from './data-store';

function OnboardingFlow() {
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const candidateData = getCandidate(1);
    setCandidate(candidateData);
    setFormData(candidateData.onboardingData);
    setCurrentStep(candidateData.onboardingStep);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    updateOnboardingData(1, formData);
    updateCandidate(1, { onboardingStep: currentStep + 1 });
    setCurrentStep(currentStep + 1);
    if (currentStep === 5) {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = () => {
    updateCandidate(1, { status: 'Onboarding Complete' });
    navigate('/candidate-dashboard');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <label>Full Name:</label> <input type="text" name="fullName" value={formData.fullName || ''} onChange={handleChange} /><br />
            <label>Email:</label> <input type="email" name="email" value={formData.email || ''} onChange={handleChange} /><br />
            <label>Phone:</label> <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} /><br />
            <label>Language:</label> <input type="text" name="language" value={formData.language || ''} onChange={handleChange} />
          </>
        );
      case 2:
        return (
          <>
            <label>Address:</label> <input type="text" name="address" value={formData.address || ''} onChange={handleChange} /><br />
            <label>SSN/Tax ID:</label> <input type="text" name="taxId" value={formData.taxId || ''} onChange={handleChange} /><br />
            <label>Eligibility:</label> <select name="eligibility" value={formData.eligibility || ''} onChange={handleChange}>
              <option value="eligible">Eligible</option>
              <option value="ineligible">Ineligible</option>
            </select>
          </>
        );
      case 3:
        return (
          <>
            <label>Bank Name:</label> <input type="text" name="bankName" value={formData.bankName || ''} onChange={handleChange} /><br />
            <label>Routing Number:</label> <input type="text" name="routingNumber" value={formData.routingNumber || ''} onChange={handleChange} /><br />
            <label>Account Number:</label> <input type="text" name="accountNumber" value={formData.accountNumber || ''} onChange={handleChange} /><br />
            <label>Reimbursement:</label> <input type="checkbox" name="reimbursement" checked={formData.reimbursement || false} onChange={handleChange} />
          </>
        );
      case 4:
        return (
          <>
            <label>Upload Documents:</label> <input type="file" name="documents" /><br />
            <label>
              <input type="checkbox" name="eSign" /> I agree to the terms
            </label>
          </>
        );
      case 5:
        return (
          <div>
            <h2>Review & Submit</h2>
            <pre>{JSON.stringify(formData, null, 2)}</pre>
            <button onClick={handleFinalSubmit}>Confirm</button>
          </div>
        );
      default:
        return <p>Invalid step</p>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1>Onboarding Flow - Step {currentStep}</h1>
      {renderStepContent()}
      {currentStep < 5 && <button onClick={handleNext}>Next</button>}
    </div>
  );
}

export default OnboardingFlow;

// App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './login.js'; // Assuming login.js is in the same directory
import CandidateDashboard from './candidate-dashboard.jsx';
import OnboardingFlow from './onboarding-flow.jsx';
import Signup from './signup.js'; // Assuming signup.js is in the same directory


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
          <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
          <Route path="/onboarding-flow" element={<OnboardingFlow />} />
          <Route path="/" element={<Signup />} /> {/*Signup as default route*/}
          <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;