
import { useEffect, useState } from "react";
import { loadJobOrders } from "../data/jobOrders";

function ClientDashboard() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    // loadJobOrders() returns the saved job orders (or [] when none exist)
    setJobs(loadJobOrders());
  }, []);

  const handleApproval = (jobId) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, approved: !job.approved } : job
      )
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Client Job Dashboard</h1>
      {jobs.length === 0 ? (
        <p className="text-gray-500">No job orders yet. New job orders will appear here once created.</p>
      ) : (
      <table className="min-w-full border text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Job Title</th>
            <th className="p-2 border">Location</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="p-2 border">{job.title}</td>
              <td className="p-2 border">{job.location}</td>
              <td className="p-2 border">
                {job.approved ? "Approved" : "Pending"}
              </td>
              <td className="p-2 border">
                <button
                  onClick={() => handleApproval(job.id)}
                  className={`px-3 py-1 text-white rounded ${
                    job.approved ? "bg-red-500" : "bg-green-500"
                  }`}
                >
                  {job.approved ? "Revoke" : "Approve"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}
    </div>
  );
}

export default ClientDashboard;
