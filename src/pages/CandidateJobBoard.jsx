import { useState } from "react";
import { openJobs } from "../data/openJobs";

function CandidateJobBoard() {
  const [applied, setApplied] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [candidates, setCandidates] = useState([]); // Added state for candidates

  const handleApply = (jobId) => {
    if (!applied.includes(jobId)) {
      setApplied([...applied, jobId]);
      alert("Application submitted successfully! Our team will contact you soon.");
    }
  };

  const filteredJobs = openJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [ready, setReady] = useState(false);

return (
    <div className="p-6 max-w-6xl mx-auto">
      {ready && (
        <div 
          className="text-green-600 font-medium mb-4" 
          role="status" 
          aria-live="polite"
        >
          ✅ Ready for Submission
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Available Positions</h1>
        <input
          type="text"
          placeholder="Search jobs..."
          className="px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <div key={job.id} className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold">{job.title}</h2>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  job.status === 'Urgent' ? 'bg-red-100 text-red-800' :
                  job.status === 'Featured' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {job.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {job.location} | {job.shift} | {job.payRate}
              </p>
              <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-2">Key Requirements:</h3>
                <ul className="text-sm text-gray-600 list-disc list-inside mb-4">
                  {job.requirements.slice(0, 2).map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>

                <div className="flex justify-between items-center">
                  <button
                    className="text-blue-600 text-sm hover:underline"
                    onClick={() => setSelectedJob(job)}
                  >
                    View Details
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg ${
                      applied.includes(job.id)
                        ? "bg-gray-100 text-gray-500"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    onClick={() => handleApply(job.id)}
                    disabled={applied.includes(job.id)}
                  >
                    {applied.includes(job.id) ? "Applied" : "Apply Now"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedJob.title}</h2>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-2">{selectedJob.location}</p>
                <p className="text-gray-600">Shift: {selectedJob.shift}</p>
                <p className="text-gray-600">Pay Rate: {selectedJob.payRate}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Job Description</h3>
                <p className="text-gray-700">{selectedJob.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Requirements</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Benefits</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {selectedJob.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t">
                <button
                  className={`w-full py-2 rounded-lg ${
                    applied.includes(selectedJob.id)
                      ? "bg-gray-100 text-gray-500"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  onClick={() => {
                    handleApply(selectedJob.id);
                    setSelectedJob(null);
                  }}
                  disabled={applied.includes(selectedJob.id)}
                >
                  {applied.includes(selectedJob.id) ? "Already Applied" : "Apply Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => {
          if (window.confirm('Are you sure you want to clear all candidates? This action cannot be undone.')) {
            localStorage.removeItem("mockCandidates");
            setCandidates([]);
            // Show feedback that the operation was successful
            alert('All candidates have been cleared successfully.');
          }
        }}
        className="mt-8 mb-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        aria-label="Clear all candidates"
      >
        Clear All Candidates
      </button>
    </div>
  );
}

export default CandidateJobBoard;