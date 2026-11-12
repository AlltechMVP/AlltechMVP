
import React, { useState } from "react";

const steps = [
  "Step 1: Upload documents",
  "Step 2: Complete W-4 & I-9",
  "Step 3: Watch training video", 
  "Step 4: Confirm bank account",
];

export default function GuidedOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      alert("🎉 Onboarding complete!");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Candidate Onboarding Flow</h2>
      <div className="mb-4 p-4 border rounded shadow">
        <strong>{steps[currentStep]}</strong>
      </div>
      <button
        onClick={next}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {currentStep < steps.length - 1 ? "Next Step" : "Finish"}
      </button>
    </div>
  );
}
