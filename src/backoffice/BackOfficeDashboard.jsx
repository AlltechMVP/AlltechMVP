
import React from 'react';
import { getStoredTimesheets } from '../data/mockTimesheets';
import { getStoredInvoices } from '../data/mockInvoices';

export default function BackOfficeDashboard() {
  const timesheets = getStoredTimesheets();
  const invoices = getStoredInvoices();
  const emailLog = JSON.parse(localStorage.getItem('emailLog') || '[]');

  const thisWeek = new Date();
  thisWeek.setDate(thisWeek.getDate() - 7);

  const metrics = {
    totalHours: timesheets.reduce((sum, ts) => sum + ts.totalHours, 0),
    payrollTotal: timesheets.reduce((sum, ts) => sum + (ts.totalHours * 17), 0),
    invoiceTotal: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    emailsSent: emailLog.filter(email => 
      new Date(email.sentAt) > thisWeek
    ).length
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Back Office Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-blue-100 rounded">
          <div className="text-lg font-semibold">Total Hours</div>
          <div className="text-3xl">{metrics.totalHours}</div>
        </div>
        
        <div className="p-4 bg-green-100 rounded">
          <div className="text-lg font-semibold">Payroll Total</div>
          <div className="text-3xl">${metrics.payrollTotal}</div>
        </div>

        <div className="p-4 bg-yellow-100 rounded">
          <div className="text-lg font-semibold">Invoice Total</div>
          <div className="text-3xl">${metrics.invoiceTotal}</div>
        </div>

        <div className="p-4 bg-purple-100 rounded">
          <div className="text-lg font-semibold">Emails This Week</div>
          <div className="text-3xl">{metrics.emailsSent}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Recent Timesheets</h3>
          <div className="space-y-2">
            {timesheets.slice(-5).map(ts => (
              <div key={ts.id} className="p-2 border rounded">
                {ts.candidateName} - {ts.totalHours} hours
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Recent Invoices</h3>
          <div className="space-y-2">
            {invoices.slice(-5).map(inv => (
              <div key={inv.id} className="p-2 border rounded">
                {inv.clientName} - ${inv.totalAmount}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
