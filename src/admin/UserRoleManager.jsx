import React, { useState } from "react";

export default function UserRoleManager() {
  const [users, setUsers] = useState([
    { id: 1, name: "John Smith", email: "john@alltech.com", role: "recruiter" },
    { id: 2, name: "Sarah Jones", email: "sarah@alltech.com", role: "manager" },
    { id: 3, name: "Mike Wilson", email: "mike@alltech.com", role: "admin" }
  ]);
  const [notification, setNotification] = useState("");

  const roles = ["admin", "director", "manager", "recruiter", "sales", "finance"];

  const handleRoleChange = (userId, newRole) => {
    setUsers(users.map(user =>
      user.id === userId ? { user, role: newRole } : user
    ));
    setNotification(`Role updated successfully`);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleDeactivate = (userId) => {
    setUsers(users.filter(user => user.id !== userId));
    setNotification("User deactivated");
    setTimeout(() => setNotification(""), 3000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">User Role Management</h1>

      {notification && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {notification}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    aria-label={`Select role for ${user.name}`}
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDeactivate(user.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                    aria-label={`Deactivate ${user.name}`}
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}