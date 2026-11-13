import React from 'react';
import { QuickAddForm } from '@/components/QuickAdd.jsx';

// /companies/new — the same Quick Add form as a page (the modal version
// lives in the nav and on the Companies list).
export default function CompaniesNew() {
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Add a Prospect / Client</h1>
      <div className="bg-white border rounded-xl p-6">
        <QuickAddForm />
      </div>
    </div>
  );
}
