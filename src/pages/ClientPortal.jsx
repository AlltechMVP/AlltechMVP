
import { useEffect, useState } from "react";
import { clients } from "../data/clients";

function ClientPortal() {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(clients); // Load mock data
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Client Portal</h1>
      <table className="w-full text-left border">
        <thead>
          <tr>
            <th className="p-2 border">Client</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Open Jobs</th>
            <th className="p-2 border">Last Activity</th>
          </tr>
        </thead>
        <tbody>
          {data.map((client) => (
            <tr key={client.id}>
              <td className="p-2 border">{client.name}</td>
              <td className="p-2 border">{client.status}</td>
              <td className="p-2 border">{client.jobsOpen}</td>
              <td className="p-2 border">{client.lastActivity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientPortal;
