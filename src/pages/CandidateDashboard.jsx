import React from 'react';
import { Link } from 'react-router-dom';

export default function CandidateDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Candidate Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Link to="/candidate/jobs" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-2">Browse Jobs</h3>
          <p className="text-gray-600">Find your next opportunity</p>
        </Link>

        <Link to="/candidate/jobs" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-2">My Applications</h3>
          <p className="text-gray-600">See the jobs you have applied to</p>
        </Link>

        <Link to="/timekeeping/entry" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold mb-2">Enter Time</h3>
          <p className="text-gray-600">Submit your hours</p>
        </Link>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-blue-700">
          <strong>Welcome!</strong> Use the navigation above to get started.
        </p>
      </div>
    </div>
  );
}
