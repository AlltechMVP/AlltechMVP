
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const RoleAuditLog = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase.from("role_audit_log").select("*").order("created_at", { ascending: false });
      setLogs(data || []);
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Role Change Audit Log</h1>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Changed By</th>
            <th className="p-2 border">User Affected</th>
            <th className="p-2 border">Old Role</th>
            <th className="p-2 border">New Role</th>
            <th className="p-2 border">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="p-2 border">{log.admin_email}</td>
              <td className="p-2 border">{log.user_email}</td>
              <td className="p-2 border">{log.old_role}</td>
              <td className="p-2 border">{log.new_role}</td>
              <td className="p-2 border">{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoleAuditLog;
