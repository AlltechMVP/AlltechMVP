
import React, { useState, useEffect } from 'react';

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const storedCandidates = JSON.parse(localStorage.getItem("mockCandidates")) || [];
    setCandidates(storedCandidates);
  }, []);

  const markReady = (index) => {
    const updatedCandidates = [...candidates];
    updatedCandidates[index].ready = true;
    saveAndRender(updatedCandidates);
  };

  const addNote = (index) => {
    const note = window.prompt("Enter note for this candidate:");
    if (note) {
      const updatedCandidates = [...candidates];
      updatedCandidates[index].note = note;
      saveAndRender(updatedCandidates);
    }
  };

  const saveAndRender = (updatedCandidates) => {
    localStorage.setItem("mockCandidates", JSON.stringify(updatedCandidates));
    setCandidates(updatedCandidates);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Recruiter Dashboard</h2>
      <div className="space-y-4">
        {candidates.map((c, index) => (
          <div key={index} className="border border-gray-200 p-4 rounded-lg shadow-sm">
            <div className="font-semibold text-lg">{c.name}</div>
            <div className="text-gray-600">Email: {c.email}</div>
            <div className="text-gray-600">Job: {c.job}</div>
            <div className="text-gray-600">Availability: {c.availability}</div>
            <div className="text-gray-600">Resume: {c.resume}</div>
            <div className="text-gray-600">Onboarding: {c.completedSteps || 0}/4 steps completed</div>
            {c.note && <div className="text-gray-600">Note: {c.note}</div>}
            <div className="mt-4 space-x-2">
              <button 
                onClick={() => markReady(index)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Mark Ready
              </button>
              <button 
                onClick={() => addNote(index)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Note
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
