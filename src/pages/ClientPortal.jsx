
import { useEffect, useState } from "react";
import { clients } from "../data/clients";

function ClientPortal() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setData(clients);
  }, []);

  const filteredData = data.filter(client => {
    if (filter === "all") return true;
    return client.status.toLowerCase() === filter;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Client Portal</h1>
        <select 
          className="border p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Clients</option>
          <option value="active">Active</option>
          <option value="pending approval">Pending</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 border-b">Client</th>
              <th className="p-4 border-b">Location</th>
              <th className="p-4 border-b">Industry</th>
              <th className="p-4 border-b">Status</th>
              <th className="p-4 border-b">Open Jobs</th>
              <th className="p-4 border-b">Active Assignments</th>
              <th className="p-4 border-b">Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="p-4 border-b">{client.name}</td>
                <td className="p-4 border-b">{client.location}</td>
                <td className="p-4 border-b">{client.industry}</td>
                <td className="p-4 border-b">
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    client.status === "Active" ? "bg-green-100 text-green-800" :
                    client.status === "Pending Approval" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="p-4 border-b">{client.jobsOpen}</td>
                <td className="p-4 border-b">{client.activeAssignments}</td>
                <td className="p-4 border-b">{client.lastActivity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientPortal;
