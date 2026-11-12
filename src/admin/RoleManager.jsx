
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext.jsx";
import RoleAuditLog from "../components/admin/RoleAuditLog.jsx";

export default function RoleManager() {
  const { session } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");
  const [pendingChange, setPendingChange] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("email");

    if (error) {
      setError("Failed to fetch users: " + error.message);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (userId, newRole, email) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (updateError) throw updateError;

      const adminEmail = session?.user?.email
        || JSON.parse(localStorage.getItem("user") || "null")?.email
        || "unknown";
      const { error: logError } = await supabase.from("role_audit_log").insert([{
        admin_email: adminEmail,
        user_email: email,
        old_role: user.role,
        new_role: newRole
      }]);

      if (logError) throw logError;

      setUpdateMessage(`Updated role for ${email} successfully`);
      setTimeout(() => setUpdateMessage(""), 3000);
      setPendingChange(null);
      fetchUsers();
    } catch (err) {
      setError(`Failed to update role: ${err.message}`);
      setTimeout(() => setError(""), 3000);
      setPendingChange(null);
    }
  };

  const roles = ["admin", "ceo", "cfo", "director", "branch-manager", "sales-rep", "sales-manager", "recruiter", "candidate", "client", "backoffice"];

  return (
    <div className="p-6" role="region" aria-label="User Role Management">
      <h1 className="text-2xl font-bold mb-4">User Role Management</h1>

      {updateMessage && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded" role="alert">
          {updateMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500" role="status">Loading users</p>
      ) : (
        <table className="w-full border rounded" role="table">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-left" scope="col">Email</th>
              <th className="p-2 border text-left" scope="col">Current Role</th>
              <th className="p-2 border text-left" scope="col">Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border capitalize">{user.role}</td>
                <td className="p-2 border">
                  <select
                    aria-label={`Change role for ${user.email}`}
                    value={pendingChange?.userId === user.id ? pendingChange.newRole : user.role}
                    onChange={(e) => {
                      if (e.target.value === user.role) {
                        setPendingChange(null);
                      } else {
                        setPendingChange({ userId: user.id, email: user.email, oldRole: user.role, newRole: e.target.value });
                      }
                    }}
                    className="border px-2 py-1 rounded w-full"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                  {pendingChange?.userId === user.id && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span>Change to &ldquo;{pendingChange.newRole}&rdquo;?</span>
                      <button
                        onClick={() => updateRole(user.id, pendingChange.newRole, user.email)}
                        className="bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setPendingChange(null)}
                        className="border px-2 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <RoleAuditLog />
    </div>
  );
}
