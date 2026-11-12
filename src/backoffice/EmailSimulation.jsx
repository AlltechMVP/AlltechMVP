
import React, { useState, useEffect } from 'react';
import { getStoredInvoices } from '../data/mockInvoices';

export default function EmailSimulation() {
  const [selectedClient, setSelectedClient] = useState('');
  const [message, setMessage] = useState('');
  const [emailLog, setEmailLog] = useState([]);
  const invoices = getStoredInvoices();

  useEffect(() => {
    const storedLog = JSON.parse(localStorage.getItem('emailLog') || '[]');
    setEmailLog(storedLog);
  }, []);

  const sendEmail = () => {
    const newEmail = {
      to: `${selectedClient.toLowerCase().replace(/\s/g, '.')}@company.com`,
      subject: `Invoice for Week of ${new Date().toLocaleDateString()}`,
      sentAt: new Date().toISOString(),
      invoiceId: invoices.find(i => i.clientName === selectedClient)?.id
    };

    const updatedLog = [emailLog, newEmail];
    setEmailLog(updatedLog);
    localStorage.setItem('emailLog', JSON.stringify(updatedLog));
    setMessage('');
    alert('Email sent successfully!');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Email Simulation</h2>

      <div className="max-w-2xl">
        <div className="mb-4">
          <label className="block mb-2">Client</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Client</option>
            {[new Set(invoices.map(i => i.clientName))].map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded h-32"
            placeholder="Enter email message"
          />
        </div>

        <button
          onClick={sendEmail}
          disabled={!selectedClient || !message}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Send Email
        </button>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Email Log</h3>
          {emailLog.map((email, idx) => (
            <div key={idx} className="mb-2 p-2 border rounded">
              <div>To: {email.to}</div>
              <div>Subject: {email.subject}</div>
              <div>Sent: {new Date(email.sentAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
