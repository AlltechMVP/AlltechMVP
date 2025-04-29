import { useEffect, useState } from "react";
import { loadUsers } from "../data/users";

function RecruiterDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const users = loadUsers();
    // Filter users who are candidates
    const candidateUsers = users.filter(user => user.role === "candidate");
    setCandidates(candidateUsers);
  }, []);

  const filteredCandidates = candidates.filter(c => {
    if (statusFilter === "all") return true;
    return c.status === statusFilter;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Recruiter Dashboard</h1>

      <div className="mb-4">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="interviewing">Interviewing</option>
          <option value="placed">Placed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id}>
                <td className="px-6 py-4 whitespace-nowrap">{candidate.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{candidate.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{candidate.status || 'New'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecruiterDashboard;