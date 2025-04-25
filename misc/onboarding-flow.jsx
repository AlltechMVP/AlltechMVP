import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadCandidates, updateOnboardingStep } from './data-store';

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [candidateId, setCandidateId] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const candidates = loadCandidates();
    const userCandidate = candidates.find(c => c.email === currentUser.email);
    if (userCandidate) {
      setCandidateId(userCandidate.id);
      setCurrentStep(userCandidate.onboardingStep || 1);
    }
  }, []);

  const handleNext = () => {
    const nextStep = currentStep + 1;
    updateOnboardingStep(candidateId, nextStep);
    setCurrentStep(nextStep);
    if (nextStep > 5) {
      navigate('/candidate-dashboard');
    }
  };

  const steps = [
    {
      title: 'Personal Information',
      fields: ['fullName', 'phone', 'address']
    },
    {
      title: 'Employment Details',
      fields: ['ssn', 'workAuth', 'startDate']
    },
    {
      title: 'Direct Deposit',
      fields: ['bankName', 'routingNumber', 'accountNumber']
    },
    {
      title: 'Document Upload',
      fields: ['idDocument', 'w4Form']
    },
    {
      title: 'Review & Sign',
      fields: ['signature']
    }
  ];

  const currentStepData = steps[currentStep - 1];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-center mt-2 text-sm text-gray-600">
          Step {currentStep} of {steps.length}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6">{currentStepData.title}</h2>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {currentStepData.fields.map(field => (
            <div key={field} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
              </label>
              <input
                type={field.includes('ssn') || field.includes('Number') ? 'password' : 'text'}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                value={formData[field] || ''}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              />
            </div>
          ))}

          <button
            onClick={handleNext}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {currentStep === steps.length ? 'Submit' : 'Next Step'}
          </button>
        </form>
      </div>
    </div>
  );
}