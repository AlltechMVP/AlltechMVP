
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadCandidates, updateCandidate } from './data-store';

const steps = [
  {
    title: 'Personal Info',
    fields: ['fullName', 'email', 'phone', 'language']
  },
  {
    title: 'Address & Tax Info',
    fields: ['address', 'taxId', 'eligibility']
  },
  {
    title: 'Direct Deposit',
    fields: ['bankName', 'routingNumber', 'accountNumber', 'acceptReimbursement']
  },
  {
    title: 'Documents',
    fields: ['fileUpload', 'signatureAccepted']
  },
  {
    title: 'Review & Submit',
    fields: []
  }
];

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [candidate, setCandidate] = useState(null);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const candidates = loadCandidates();
    const candidate = candidates.find(c => c.id === 1);
    setCandidate(candidate);
    setFormData(candidate.onboardingData || {});
    setCurrentStep(candidate.onboardingStep || 1);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    const updates = {
      onboardingData: formData,
      onboardingStep: currentStep + 1
    };
    
    if (currentStep === steps.length) {
      updates.status = 'Onboarding Complete';
    }
    
    updateCandidate(candidate.id, updates);
    
    if (currentStep === steps.length) {
      navigate('/candidate-dashboard');
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  if (!candidate) return <div>Loading...</div>;

  const progress = ((currentStep - 1) / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step, idx) => (
            <div 
              key={idx}
              className={`text-sm ${idx + 1 <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
            >
              Step {idx + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6">{steps[currentStep - 1].title}</h2>

        <div className="space-y-4">
          {currentStep === 1 && (
            <>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName || ''}
                onChange={e => handleInputChange('fullName', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email || ''}
                onChange={e => handleInputChange('email', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={formData.phone || ''}
                onChange={e => handleInputChange('phone', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <select
                value={formData.language || ''}
                onChange={e => handleInputChange('language', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Language</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
            </>
          )}

          {currentStep === 2 && (
            <>
              <textarea
                placeholder="Address"
                value={formData.address || ''}
                onChange={e => handleInputChange('address', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="SSN/Tax ID"
                value={formData.taxId || ''}
                onChange={e => handleInputChange('taxId', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <select
                value={formData.eligibility || ''}
                onChange={e => handleInputChange('eligibility', e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Work Eligibility</option>
                <option value="citizen">US Citizen</option>
                <option value="permanent">Permanent Resident</option>
                <option value="visa">Work Visa</option>
              </select>
            </>
          )}

          {currentStep === 3 && (
            <>
              <input
                type="text"
                placeholder="Bank Name"
                value={formData.bankName || ''}
                onChange={e => handleInputChange('bankName', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Routing Number"
                value={formData.routingNumber || ''}
                onChange={e => handleInputChange('routingNumber', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                placeholder="Account Number"
                value={formData.accountNumber || ''}
                onChange={e => handleInputChange('accountNumber', e.target.value)}
                className="w-full p-2 border rounded"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.acceptReimbursement || false}
                  onChange={e => handleInputChange('acceptReimbursement', e.target.checked)}
                />
                <span>Accept reimbursement to this account</span>
              </label>
            </>
          )}

          {currentStep === 4 && (
            <>
              <div className="border-2 border-dashed p-4 text-center">
                <button 
                  onClick={() => handleInputChange('fileUpload', 'mock-file.pdf')}
                  className="text-blue-600"
                >
                  Upload Documents
                </button>
                {formData.fileUpload && (
                  <p className="mt-2 text-sm text-gray-600">
                    Uploaded: {formData.fileUpload}
                  </p>
                )}
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.signatureAccepted || false}
                  onChange={e => handleInputChange('signatureAccepted', e.target.checked)}
                />
                <span>I agree to the terms and conditions</span>
              </label>
            </>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="font-medium">Review Your Information</h3>
              {Object.entries(formData).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key}</span>
                  <span>{typeof value === 'boolean' ? value.toString() : value}</span>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={handleNext}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            {currentStep === steps.length ? 'Submit' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
}
