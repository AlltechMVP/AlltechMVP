
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadUsers } from './users';

export default function Login() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const allUsers = loadUsers();
    setUsers(allUsers);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(u => u.id === parseInt(selectedUserId));
    if (!user) return;

    localStorage.setItem('currentUser', JSON.stringify(user));

    const roleRoutes = {
      admin: '/admin-dashboard',
      recruiter: '/recruiter-dashboard',
      sales_rep: '/sales-dashboard',
      client: '/client-approvals',
      executive: '/executive-dashboard'
    };

    navigate(roleRoutes[user.role] || '/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Alltech Staffing</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Select User</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Choose a user...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
