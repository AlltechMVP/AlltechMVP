
import { useEffect, useState } from "react";
import { clients } from "../data/clients";

function ClientPortal() {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    setData(clients);
  }, []);

  const filteredData = data.filter(client => {
    if (filter === "all") return true;
    return client.status.toLowerCase() === filter;
  });

  const handleClientSelect = (client) => {
    setSelectedClient(client);
  };

  const handleStatusChange = (clientId, newStatus) => {
    setData(data.map(client => 
      client.id === clientId ? {...client, status: newStatus} : client
    ));
    setSelectedClient(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Client Portal</h1>
        <div className="flex gap-4">
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
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Total Clients</h3>
          <p className="text-2xl">{data.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Active Clients</h3>
          <p className="text-2xl">{data.filter(c => c.status === "Active").length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Total Open Jobs</h3>
          <p className="text-2xl">{data.reduce((sum, client) => sum + client.jobsOpen, 0)}</p>
        </div>
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
              <th className="p-4 border-b">Actions</th>
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
                <td className="p-4 border-b">
                  <button 
                    onClick={() => handleClientSelect(client)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Manage Client: {selectedClient.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select 
                  className="w-full border p-2 rounded"
                  value={selectedClient.status}
                  onChange={(e) => handleStatusChange(selectedClient.id, e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleStatusChange(selectedClient.id, selectedClient.status)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientPortal;
