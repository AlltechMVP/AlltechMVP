
import React, { useEffect, useState } from 'react';
import { loadSalesData, updateSalesContact, addFollowUpNote, updateContactPerson, closeLostAccount } from './salesData';

export default function SalesDashboard() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const salesData = loadSalesData();
    setContacts(salesData);
  }, []);

  const stages = ['Lead', 'Demo', 'Proposal', 'Closed'];

  const advancePipeline = (id) => {
    const contact = contacts.find(c => c.id === id);
    const currentIndex = stages.indexOf(contact.stage);
    const nextStage = stages[(currentIndex + 1) % stages.length];
    const updatedContacts = updateSalesContact(id, { stage: nextStage });
    setContacts(updatedContacts);
  };

  const handleAddNote = (id) => {
    const note = window.prompt('Enter follow-up note:');
    if (note) {
      const updatedContacts = addFollowUpNote(id, note);
      setContacts(updatedContacts);
    }
  };

  const handleChangeContact = (id) => {
    const newContact = window.prompt('Enter new contact name:');
    if (newContact) {
      const updatedContacts = updateContactPerson(id, newContact);
      setContacts(updatedContacts);
    }
  };

  const handleCloseLost = (id) => {
    const updatedContacts = closeLostAccount(id);
    setContacts(updatedContacts);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Sales Pipeline</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map(contact => (
          <div key={contact.id} className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold">{contact.company}</h2>
            <p className="text-gray-600">Contact: {contact.contact}</p>
            <p className="text-gray-700">Type: {contact.type}</p>
            <div className="my-2">
              <span className={`px-2 py-1 rounded text-sm ${
                contact.stage === 'Closed Lost' ? 'bg-red-100 text-red-800' :
                contact.stage === 'Closed' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {contact.stage}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Last Touch: {new Date(contact.lastTouch).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              Next Follow-up: {new Date(contact.nextFollowUp).toLocaleDateString()}
            </p>
            
            <div className="mt-4 space-y-2">
              {contact.notes.map((note, index) => (
                <div key={index} className="text-sm text-gray-600 border-t pt-2">
                  <p>{note.text}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(note.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => advancePipeline(contact.id)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Advance Pipeline
              </button>
              <button
                onClick={() => handleAddNote(contact.id)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Add Follow-up Note
              </button>
              <button
                onClick={() => handleChangeContact(contact.id)}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Change Contact
              </button>
              <button
                onClick={() => handleCloseLost(contact.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Close Lost
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
