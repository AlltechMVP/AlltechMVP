
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadJobOrders, addNoteToJob, removeCandidateFromJob, updateJobOrder } from './jobOrders';

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const jobs = loadJobOrders();
    const foundJob = jobs.find(j => j.id === parseInt(id));
    setJob(foundJob);
  }, [id]);

  const addCandidate = () => {
    const randomId = Math.floor(Math.random() * 1000);
    const updatedJobs = updateJobOrder(parseInt(id), {
      submittedCandidates: [...(job.submittedCandidates || []), randomId]
    });
    setJob(updatedJobs.find(j => j.id === parseInt(id)));
  };

  const removeCandidate = () => {
    if (job.submittedCandidates.length === 0) return;
    const lastId = job.submittedCandidates[job.submittedCandidates.length - 1];
    const updatedJobs = removeCandidateFromJob(parseInt(id), lastId);
    setJob(updatedJobs.find(j => j.id === parseInt(id)));
  };

  const handleAddNote = () => {
    const note = window.prompt('Enter note:');
    if (note) {
      const updatedJobs = addNoteToJob(parseInt(id), note);
      setJob(updatedJobs.find(j => j.id === parseInt(id)));
    }
  };

  if (!job) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{job.title}</h1>
      
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Job Description</h2>
        <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Assigned Recruiters</h2>
        <ul className="list-disc list-inside">
          {job.recruiterIds.map(id => (
            <li key={id}>Recruiter #{id}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Submitted Candidates</h2>
        <ul className="list-disc list-inside">
          {job.submittedCandidates.map(candidateId => (
            <li key={candidateId}>Candidate #{candidateId}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Notes</h2>
        <div className="space-y-2">
          {job.notes.map((note, index) => (
            <div key={index} className="border-b pb-2">
              <p className="text-gray-700">{note.text}</p>
              <p className="text-sm text-gray-500">
                {new Date(note.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={addCandidate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Submit Candidate
        </button>
        <button
          onClick={removeCandidate}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Remove Candidate
        </button>
        <button
          onClick={handleAddNote}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Note
        </button>
      </div>
    </div>
  );
}
