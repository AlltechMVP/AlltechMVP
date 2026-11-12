
import React, { useEffect, useState } from "react";
import { hasAccess } from "../utils/roleUtils";

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")); // mock current user

  if (!hasAccess(user, "admin")) {
    return <div className="p-4 text-red-600">Unauthorized</div>;
  }

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("auditLog")) || [];
    setLogs(stored.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Audit Log</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">User ID</th>
            <th className="p-2">Action</th>
            <th className="p-2">Module</th>
            <th className="p-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{log.userId}</td>
              <td className="p-2">{log.action}</td>
              <td className="p-2">{log.module}</td>
              <td className="p-2">{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
