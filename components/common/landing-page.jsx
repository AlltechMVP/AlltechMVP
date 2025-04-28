
import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to Alltech MVP
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Streamlining Staffing Operations with Alltech
        </p>
        <Link
          to="/sales-rep-dashboard"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Enter Platform
        </Link>
      </div>
    </div>
  );
}
