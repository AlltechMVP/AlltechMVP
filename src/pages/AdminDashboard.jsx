
import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    submittedTimesheets: 0
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const useSupabase = false; // TODO: Enable when integrating with Supabase

  useEffect(() => {
    try {
      // Initialize mock data if not present
      if (!localStorage.getItem("mockAdminStats")) {
        localStorage.setItem("mockAdminStats", JSON.stringify({
          totalCandidates: 143,
          activeJobs: 12,
          submittedTimesheets: 58
        }));
      }

      if (!localStorage.getItem("mockAdminActivity")) {
        localStorage.setItem("mockAdminActivity", JSON.stringify([
          { type: "candidate", text: "Jane Doe marked ready", timestamp: "2024-04-29T14:00Z" },
          { type: "job", text: "Client approved candidate John Smith", timestamp: "2024-04-29T13:45Z" },
          { type: "system", text: "New recruiter added: Alex Moore", timestamp: "2024-04-29T13:30Z" }
        ]));
      }

      const storedStats = JSON.parse(localStorage.getItem("mockAdminStats")) || {};
      const storedActivity = JSON.parse(localStorage.getItem("mockAdminActivity")) || [];
      
      setStats(storedStats);
      setActivity(storedActivity);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTypeColor = (type) => {
    switch (type) {
      case 'candidate': return 'border-green-500';
      case 'job': return 'border-blue-500';
      default: return 'border-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'candidate': return '👤';
      case 'job': return '📦';
      default: return '⚙️';
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="p-6">Loading</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-blue-600">{stats.totalCandidates}</p>
          <p className="text-gray-600">Total Candidates</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{stats.activeJobs}</p>
          <p className="text-gray-600">Active Jobs</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-3xl font-bold text-purple-600">{stats.submittedTimesheets}</p>
          <p className="text-gray-600">Submitted Timesheets</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {activity.length > 0 ? (
            activity.map((item, index) => (
              <div key={index} className={`border-l-4 pl-4 ${getTypeColor(item.type)} py-2`}>
                <p className="text-sm">
                  {getTypeIcon(item.type)} {item.text}
                  <span className="text-gray-400 ml-2">{formatTime(item.timestamp)}</span>
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>

      {/* User Management Placeholder */}
      <div className="bg-gray-50 border rounded-lg p-6 mt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">User Management</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
            Manage Users
          </button>
        </div>
        <p className="text-gray-600 mt-2">
          Manage system users, roles, and permissions
        </p>
      </div>
    </div>
  );
}
