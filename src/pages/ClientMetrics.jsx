import React from 'react';
import {
  getCandidates,
  getAssignments,
  getDemoClientId,
  getClientById,
  getJobsForClient,
  getTimesheetsForClient,
  getCandidateById,
  getAssignmentById,
  getSubmittedCandidatesForJob,
} from '../utils/storage';

function ClientMetrics() {
  const clientId = getDemoClientId();
  const client = getClientById(clientId);
  const jobs = getJobsForClient(clientId);
  const jobIds = jobs.map((j) => j.id);
  const timesheets = getTimesheetsForClient(clientId);
  const assignments = getAssignments().filter((a) => jobIds.includes(a.jobId));
  const candidates = getCandidates().filter((c) => jobIds.includes(c.submittedJobId));

  const openJobs = jobs.filter((j) => j.status === 'Open').length;
  const activeAssignments = assignments.filter((a) => a.status === 'Active').length;
  const hoursSubmitted = timesheets.reduce((sum, t) => sum + (t.totalHours || 0), 0);
  const hoursApproved = timesheets
    .filter((t) => t.status === 'Approved')
    .reduce((sum, t) => sum + (t.totalHours || 0), 0);

  if (!client) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Client Metrics</h1>
        <p>No client data yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-1">Client Metrics</h1>
      <p className="text-sm text-gray-500 mb-6">
        {client.name} · {client.location} · Contact: {client.contactPerson} ({client.contactEmail})
      </p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Open Jobs</p>
          <p className="text-2xl font-semibold">{openJobs}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Candidates in Pipeline</p>
          <p className="text-2xl font-semibold">{candidates.length}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Active Assignments</p>
          <p className="text-2xl font-semibold">{activeAssignments}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Hours Submitted</p>
          <p className="text-2xl font-semibold">{hoursSubmitted}</p>
        </div>
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Hours Approved</p>
          <p className="text-2xl font-semibold">{hoursApproved}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-2">Jobs</h2>
      <table className="w-full text-left border mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Job</th>
            <th className="p-2 border">Openings</th>
            <th className="p-2 border">Rate</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Candidates</th>
            <th className="p-2 border">Active Assignments</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 && (
            <tr><td className="p-2 border" colSpan="6">No jobs yet.</td></tr>
          )}
          {jobs.map((job) => (
            <tr key={job.id}>
              <td className="p-2 border">{job.title}</td>
              <td className="p-2 border">{job.openings}</td>
              <td className="p-2 border">${job.rate}/hr</td>
              <td className="p-2 border">{job.status}</td>
              <td className="p-2 border">{getSubmittedCandidatesForJob(job.id).length}</td>
              <td className="p-2 border">
                {assignments.filter((a) => a.jobId === job.id && a.status === 'Active').length}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mb-2">Timesheets</h2>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Week Ending</th>
            <th className="p-2 border">Candidate</th>
            <th className="p-2 border">Hours</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Payroll</th>
          </tr>
        </thead>
        <tbody>
          {timesheets.length === 0 && (
            <tr><td className="p-2 border" colSpan="5">No timesheets yet.</td></tr>
          )}
          {timesheets.map((ts) => {
            const assignment = getAssignmentById(ts.assignmentId);
            const candidate = assignment ? getCandidateById(assignment.candidateId) : null;
            return (
              <tr key={ts.id}>
                <td className="p-2 border">{ts.weekEnding}</td>
                <td className="p-2 border">{candidate ? candidate.name : '—'}</td>
                <td className="p-2 border">{ts.totalHours}</td>
                <td className="p-2 border">{ts.status}</td>
                <td className="p-2 border">{ts.payrollStatus}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ClientMetrics;
