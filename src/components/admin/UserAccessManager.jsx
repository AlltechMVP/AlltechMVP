
import React, { useState, useEffect } from "react";
import { hasAccess } from "../../utils/roleUtils";

export default function UserAccessManager() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("user")); // For access control

  const roles = ["recruiter", "client", "cfo", "ceo", "admin", "sales_rep", "branch_manager", "director"];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("mockUsers")) || [
      { id: "u001", email: "ceo@alltech.com", role: "ceo", active: true },
      { id: "u002", email: "recruiter@alltech.com", role: "recruiter", active: true },
      { id: "u003", email: "client@company.com", role: "client", active: true },
    ];
    setUsers(stored);
  }, []);

  if (!hasAccess(currentUser, "admin")) {
    return <div className="p-4 text-red-600">Unauthorized: Admin access required</div>;
  }

  const updateUser = (index, changes) => {
    const updated = [users];
    updated[index] = { updated[index], changes };
    setUsers(updated);
    localStorage.setItem("mockUsers", JSON.stringify(updated));
    setMessage("User updated successfully");
    setTimeout(() => setMessage(""), 3000);
  };

  const addNewUser = () => {
    const email = prompt("Enter user email:");
    if (email) {
      const newUser = {
        id: `u${users.length + 1}`.padStart(4, '0'),
        email,
        role: "recruiter",
        active: true
      };
      setUsers([users, newUser]);
      localStorage.setItem("mockUsers", JSON.stringify([users, newUser]));
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">User Access Management</h2>
        <button 
          onClick={addNewUser}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add User
        </button>
      </div>
      
      {message && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
          {message}
        </div>
      )}

      <table className="w-full border-collapse table-auto">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.role}</td>
              <td className="p-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user.active}
                    onChange={(e) => updateUser(i, { active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </td>
              <td className="p-2">
                <select
                  value={user.role}
                  onChange={(e) => updateUser(i, { role: e.target.value })}
                  className="border rounded px-2 py-1"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>
                      {role.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
