
import { useEffect, useState } from "react";
import { candidates } from "../data/candidates";
import { jobs } from "../data/jobs";

function RecruiterDashboard() {
  const [data, setData] = useState([]);
  const [jobView, setJobView] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    setData(candidates);
  }, []);

  const handleFilterByJob = (jobId) => {
    setJobView(jobId === jobView ? null : jobId);
  };

  const handleStatusChange = (candidateId, newStatus) => {
    setData(prev => prev.map(c => 
      c.id === candidateId ? {...c, status: newStatus} : c
    ));
  };

  const handleNoteChange = (candidateId, newNote) => {
    setData(prev => prev.map(c => 
      c.id === candidateId ? {...c, notes: newNote} : c
    ));
    setEditingNote(null);
  };

  const filtered = data.filter(c => {
    const matchesJob = jobView ? c.jobId === jobView : true;
    const matchesStatus = statusFilter === "all" ? true : c.status === statusFilter;
    return matchesJob && matchesStatus;
  });

  const statusOptions = ["Interviewing", "Onboarding", "Hired", "Rejected"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Recruiter Dashboard</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          {jobs.map((job) => (
            <button
              key={job.id}
              className={`px-4 py-2 rounded-lg ${
                jobView === job.id 
                  ? "bg-blue-500 text-white" 
                  : "border border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => handleFilterByJob(job.id)}
            >
              {job.title}
            </button>
          ))}
        </div>

        <select 
          className="border rounded-lg px-3 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 border-b">Name</th>
              <th className="p-4 border-b">Contact</th>
              <th className="p-4 border-b">Job Title</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b">Submitted</th>
              <th className="p-4 border-b">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="p-4 border-b font-medium">{c.name}</td>
                <td className="p-4 border-b">
                  <div>{c.email}</div>
                  <div className="text-sm text-gray-500">{c.phone}</div>
                </td>
                <td className="p-4 border-b">{c.jobTitle}</td>
                <td className="p-4 border-b">
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td className="p-4 border-b">{c.submitted}</td>
                <td className="p-4 border-b">
                  {editingNote === c.id ? (
                    <input
                      type="text"
                      value={c.notes}
                      onChange={(e) => handleNoteChange(c.id, e.target.value)}
                      onBlur={() => setEditingNote(null)}
                      autoFocus
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <div 
                      onClick={() => setEditingNote(c.id)}
                      className="cursor-pointer hover:bg-gray-100 rounded p-1"
                    >
                      {c.notes}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecruiterDashboard;
