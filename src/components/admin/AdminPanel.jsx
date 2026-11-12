
import React, { useState, useEffect } from "react";
import { hasAccess } from "../../utils/roleUtils";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const roles = ["ceo", "cfo", "admin", "recruiter", "client", "sales", "branch", "director"];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("mockUsers")) || [
      { id: "u001", email: "ceo@alltech.com", role: "ceo", active: true },
      { id: "u002", email: "recruiter@alltech.com", role: "recruiter", active: true },
      { id: "u003", email: "client@company.com", role: "client", active: true }
    ];
    setUsers(stored);
  }, []);

  if (!hasAccess(currentUser, ["admin"])) {
    return <div className="p-4 text-red-600">Unauthorized: Admin access required</div>;
  }

  const updateUser = async (index, changes) => {
    try {
      const updated = [...users];
      updated[index] = { ...updated[index], ...changes };
      setUsers(updated);
      localStorage.setItem("mockUsers", JSON.stringify(updated));
      setMessage("User updated successfully");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError("Failed to update user: " + err.message);
      setTimeout(() => setError(""), 3000);
    }
  };

  const addNewUser = () => {
    const email = prompt("Enter user email (e.g., user@example.com):");
    if (!email || !email.includes("@")) {
      setError("Invalid email format");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      setError("User already exists");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const newUser = {
      id: `u${(users.length + 1).toString().padStart(3, "0")}`,
      email,
      role: "recruiter",
      active: true
    };

    setUsers(prev => [...prev, newUser]);
    localStorage.setItem("mockUsers", JSON.stringify([...users, newUser]));
    setMessage("New user added successfully");
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Access Management</h2>
        <button
          onClick={addNewUser}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          Add User
        </button>
      </div>

      {message && (
        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded" role="alert">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded" role="alert">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-4 text-left border-b">Email</th>
              <th className="p-4 text-left border-b">Role</th>
              <th className="p-4 text-left border-b">Status</th>
              <th className="p-4 text-left border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user.id} className="border-b last:border-b-0 hover:bg-gray-50">
                <td className="p-4">{user.email}</td>
                <td className="p-4 capitalize">{user.role}</td>
                <td className="p-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={user.active}
                      onChange={(e) => updateUser(i, { active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => updateUser(i, { role: e.target.value })}
                    className="border rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
