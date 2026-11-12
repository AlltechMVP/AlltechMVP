import React from 'react';

export default function Loader({ label = 'Loading', className = '' }) {
  return (
    <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`} role="status" aria-live="polite">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}
