import React from 'react';

// Slice 7: shown when the backend denies access to a record set (RLS
// 403 / 42501). This is a permission denial, NOT an outage — the page
// must not fall back to the unscoped demo store, so it renders an empty
// state with no data instead.
export default function AccessDenied({ hint } = {}) {
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
        <p className="font-medium">You don&apos;t have access to this data.</p>
        <p className="mt-1 text-red-700">
          {hint || 'Your account role does not allow viewing these records. If you think this is a mistake, contact your administrator.'}
        </p>
      </div>
    </div>
  );
}
