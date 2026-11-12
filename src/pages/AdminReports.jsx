import React from 'react';
import {
  getCandidates,
  getJobs,
  getAssignments,
  getTimesheets,
  getInvoices,
  getSubmittedCandidatesForJob,
  getJobById,
} from '../utils/storage';

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function AdminReports() {
  const candidates = getCandidates();
  const jobs = getJobs();
  const assignments = getAssignments();
  const timesheets = getTimesheets();
  const invoices = getInvoices();

  const statusCounts = {};
  candidates.forEach((c) => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
  });

  const totalBilled = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + (i.amountPaid || 0), 0);
  const totalOpen = invoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  const exportCandidates = () => {
    downloadCsv('candidates-report.csv', [
      ['Name', 'Email', 'Phone', 'Status', 'Job'],
      ...candidates.map((c) => [
        c.name,
        c.email,
        c.phone || '',
        c.status,
        getJobById(c.submittedJobId)?.title || '',
      ]),
    ]);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Admin Reports</h1>
        <button
          onClick={exportCandidates}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Download candidates CSV
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">Reports read the demo data store.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Total Candidates</p>
          <p className="text-2xl font-semibold">{candidates.length}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Open Jobs</p>
          <p className="text-2xl font-semibold">{jobs.filter((j) => j.status === 'Open').length}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Active Assignments</p>
          <p className="text-2xl font-semibold">{assignments.filter((a) => a.status === 'Active').length}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Timesheets</p>
          <p className="text-2xl font-semibold">{timesheets.length}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Total Billed</p>
          <p className="text-2xl font-semibold">${totalBilled.toLocaleString()}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Total Open (AR)</p>
          <p className="text-2xl font-semibold">${totalOpen.toLocaleString()}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2">Candidates by status</h2>
      <table className="w-full text-left border mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Count</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(statusCounts).length === 0 && (
            <tr><td className="p-2 border" colSpan="2">No candidates yet.</td></tr>
          )}
          {Object.entries(statusCounts).map(([status, count]) => (
            <tr key={status}>
              <td className="p-2 border">{status}</td>
              <td className="p-2 border">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mb-2">Jobs</h2>
      <table className="w-full text-left border mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Job</th>
            <th className="p-2 border">Client</th>
            <th className="p-2 border">Openings</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Candidates</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 && (
            <tr><td className="p-2 border" colSpan="5">No jobs yet.</td></tr>
          )}
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="p-2 border">{job.title}</td>
              <td className="p-2 border">{job.client_name}</td>
              <td className="p-2 border">{job.openings}</td>
              <td className="p-2 border">{job.status}</td>
              <td className="p-2 border">{getSubmittedCandidatesForJob(job.id).length}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mb-2">Invoices</h2>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Invoice</th>
            <th className="p-2 border">Client</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Paid</th>
            <th className="p-2 border">Balance</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.length === 0 && (
            <tr><td className="p-2 border" colSpan="6">No invoices yet.</td></tr>
          )}
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="p-2 border">{inv.invoiceNumber}</td>
              <td className="p-2 border">{inv.clientName}</td>
              <td className="p-2 border">${(inv.total || 0).toLocaleString()}</td>
              <td className="p-2 border">${(inv.amountPaid || 0).toLocaleString()}</td>
              <td className="p-2 border">${(inv.balanceDue || 0).toLocaleString()}</td>
              <td className="p-2 border">{inv.status}</td>
            </tr>
          ))}
          {invoices.length > 0 && (
            <tr className="font-semibold bg-gray-50">
              <td className="p-2 border" colSpan="2">Totals</td>
              <td className="p-2 border">${totalBilled.toLocaleString()}</td>
              <td className="p-2 border">${totalPaid.toLocaleString()}</td>
              <td className="p-2 border">${totalOpen.toLocaleString()}</td>
              <td className="p-2 border"></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminReports;
