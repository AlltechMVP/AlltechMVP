
import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to Alltech MVP</h1>
      <p className="text-lg mb-8 text-center">Streamlining Staffing Operations with Alltech.</p>
      <Link to="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Enter Platform
      </Link>
    </div>
  );
}

export default LandingPage;
