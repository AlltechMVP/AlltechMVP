
import React, { useState, useEffect } from 'react';
import { getStoredTimesheets } from '../data/mockTimesheets';
import { getStoredInvoices, saveInvoices } from '../data/mockInvoices';

export default function InvoiceGenerator() {
  const [invoices, setInvoices] = useState([]);
  const BILL_RATE = 26;

  useEffect(() => {
    const timesheets = getStoredTimesheets();
    const approvedSheets = timesheets.filter(ts => ts.status === "Approved");
    
    // Group by client
    const clientGroups = approvedSheets.reduce((acc, ts) => {
      const clientId = ts.jobId.split('-')[0]; // Mock client ID from job ID
      if (!acc[clientId]) {
        acc[clientId] = [];
      }
      acc[clientId].push(ts);
      return acc;
    }, {});

    const generatedInvoices = Object.entries(clientGroups).map(([clientId, sheets]) => {
      const lineItems = sheets.map(ts => ({
        candidateName: ts.candidateName,
        hours: ts.totalHours,
        amount: ts.totalHours * BILL_RATE
      }));

      const totalHours = lineItems.reduce((sum, item) => sum + item.hours, 0);
      const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

      return {
        id: `INV-${Date.now()}-${clientId}`,
        clientId,
        clientName: `Client ${clientId}`, // Mock client name
        lineItems,
        totalHours,
        totalAmount,
        status: "Pending"
      };
    });

    setInvoices(generatedInvoices);
    saveInvoices(generatedInvoices);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Invoice Generator</h2>
      {invoices.map(invoice => (
        <div key={invoice.id} className="mb-8 border rounded-lg p-6 bg-white">
          <div className="flex justify-between mb-4">
            <h3 className="text-xl font-semibold">{invoice.clientName}</h3>
            <span className="text-gray-600">Invoice #{invoice.id}</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Employee</th>
                  <th className="px-4 py-2 text-right">Hours</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="px-4 py-2">{item.candidateName}</td>
                    <td className="px-4 py-2 text-right">{item.hours}</td>
                    <td className="px-4 py-2 text-right">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="px-4 py-2">Total</td>
                  <td className="px-4 py-2 text-right">{invoice.totalHours}</td>
                  <td className="px-4 py-2 text-right">${invoice.totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
