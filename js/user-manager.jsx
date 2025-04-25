
import React, { useState, useEffect } from 'react';
import { loadUsers, addUser, updateUser, deleteUser } from './users';

export default function UserManager() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(loadUsers());
  }, []);

  const handleAddUser = () => {
    const name = window.prompt('Enter user name:');
    const role = window.prompt('Enter role (admin/recruiter/sales_rep/client):');
    if (name && role) {
      const newUser = addUser({ name, role, email: `${name.toLowerCase()}@alltech.com` });
      setUsers(loadUsers());
    }
  };

  const handleEditUser = (id) => {
    const name = window.prompt('Enter new name:');
    const role = window.prompt('Enter new role:');
    if (name || role) {
      updateUser(id, { ...(name && { name }), ...(role && { role }) });
      setUsers(loadUsers());
    }
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
      setUsers(loadUsers());
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Manager</h1>
        <button 
          onClick={handleAddUser}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4">{user.id}</td>
                <td className="px-6 py-4">{user.name}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleEditUser(user.id)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
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
