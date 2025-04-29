
import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-gray-50">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">Welcome to Alltech MVP</h1>
      <p className="text-xl text-gray-600 mb-8">The future of staffing technology is here.</p>
      <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
        Get Started
      </Link>
    </div>
  );
}

export default LandingPage;
