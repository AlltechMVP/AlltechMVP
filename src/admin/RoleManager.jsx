
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function RoleManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("email");
      
    if (error) {
      setError("Failed to fetch users: " + error.message);
    } else {
      // Filter out test/system accounts
      const filteredUsers = data?.filter(u => (
        !u.email.toLowerCase().includes('test') &&
        !u.email.toLowerCase().includes('noreply') &&
        !u.email.toLowerCase().includes('system') &&
        !u.email.toLowerCase().includes('bot')
      )) || [];
      setUsers(filteredUsers);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (userId, newRole, email) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const confirm = window.confirm(
      `Are you sure you want to change role for ${email} from "${user.role}" to "${newRole}"?`
    );
    if (!confirm) return;

    try {
      const { error: updateError } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("id", userId);

      if (updateError) throw updateError;

      const { error: logError } = await supabase.from("role_audit_log").insert([{
        admin_email: JSON.parse(localStorage.getItem("user"))?.email || "unknown",
        user_email: email,
        old_role: user.role,
        new_role: newRole
      }]);

      if (logError) throw logError;

      setUpdateMessage(`Updated role for ${email} successfully`);
      setTimeout(() => setUpdateMessage(""), 3000);
      fetchUsers();
    } catch (err) {
      setError(`Failed to update role: ${err.message}`);
      setTimeout(() => setError(""), 3000);
    }
  };

  const roles = ["ceo", "cfo", "admin", "recruiter", "client", "candidate", "sales", "branch", "director"];

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
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value, user.email)}
                    className="border px-2 py-1 rounded w-full"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
