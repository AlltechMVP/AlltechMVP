import { useEffect, useState } from "react";
import { clients } from "../data/clients";

function ClientPortal() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    setData(clients);
  }, []);

  const stats = {
    totalClients: data.length,
    activeClients: data.filter(c => c.status === "Active").length,
    totalJobs: data.reduce((sum, c) => sum + c.jobsOpen, 0),
    totalAssignments: data.reduce((sum, c) => sum + c.activeAssignments, 0)
  };

  const filteredData = data.filter(client => {
    if (filter === "all") return true;
    return client.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Client Portal</h1>
          <div className="flex gap-4">
            <select 
              className="px-4 py-2 border rounded-lg shadow-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Clients</option>
              <option value="active">Active</option>
              <option value="pending approval">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Clients</h3>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalClients}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Clients</h3>
            <p className="text-2xl font-semibold text-green-600">{stats.activeClients}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Open Jobs</h3>
            <p className="text-2xl font-semibold text-blue-600">{stats.totalJobs}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Active Assignments</h3>
            <p className="text-2xl font-semibold text-purple-600">{stats.totalAssignments}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Jobs</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignments</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.contactPerson}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.industry}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${client.status === "Active" ? "bg-green-100 text-green-800" : 
                        client.status === "Pending Approval" ? "bg-yellow-100 text-yellow-800" : 
                        "bg-red-100 text-red-800"}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.jobsOpen}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.activeAssignments}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{client.billingRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ClientPortal;