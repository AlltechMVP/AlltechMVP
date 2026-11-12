import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-gray-600">The page you're looking for doesn't exist.</p>
      <Link className="inline-block mt-4 px-3 py-2 border rounded" to="/">Go home</Link>
    </div>
  );
}
