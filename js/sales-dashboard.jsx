
import React, { useEffect, useState } from 'react';

export default function SalesDashboard() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const storedContacts = JSON.parse(localStorage.getItem('salesContacts') || '[]');
    setContacts(storedContacts);
  }, []);

  const getPipelineColor = (stage) => {
    const colors = {
      'Lead': 'bg-gray-100',
      'Demo': 'bg-blue-100',
      'Proposal': 'bg-yellow-100',
      'Closed': 'bg-green-100'
    };
    return colors[stage] || 'bg-gray-100';
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Sales Pipeline</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map(contact => (
          <div key={contact.id} className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold">{contact.companyName}</h2>
            <p className="text-gray-600">{contact.contactName}</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm my-2 ${getPipelineColor(contact.stage)}`}>
              {contact.stage}
            </span>
            <p className="text-sm text-gray-500">
              Last Contact: {new Date(contact.lastTouchDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Type: {contact.companyType}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
