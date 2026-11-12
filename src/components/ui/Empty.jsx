import React from 'react';

export default function Empty({ title = 'No data found', hint = 'Try adjusting your filters.' }) {
  return (
    <div className="border rounded-xl p-6 text-center text-gray-600">
      <div className="text-base font-medium">{title}</div>
      {hint && <div className="text-sm mt-1">{hint}</div>}
    </div>
  );
}
