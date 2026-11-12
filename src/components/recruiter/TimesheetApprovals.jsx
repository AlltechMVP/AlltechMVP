import React, { useState, useEffect } from 'react';
import { getStoredTimesheets, saveTimesheets } from '../../data/mockTimesheets';

export function auditTimesheet(entry) {
  const flags = [];
  if (entry.totalHours > 12) flags.push("⚠️ Unusually long shift");
  if (!entry.breakStart && entry.totalHours > 6) flags.push("⚠️ No meal break");
  if (entry.notes && entry.notes.toLowerCase().includes("manual")) flags.push("📝 Manual entry");
  return flags;
}

export default function TimesheetApprovals() {
  const [timesheets, setTimesheets] = useState([]);
  const [comments, setComments] = useState({});

  useEffect(() => {
    const stored = getStoredTimesheets();
    setTimesheets(stored);
  }, []);

  const handleApproval = (timesheetId, status) => {
    const updated = timesheets.map(ts => {
      if (ts.id === timesheetId) {
        return {
          ts,
          status,
          comment: comments[timesheetId] || ''
        };
      }
      return ts;
    });
    setTimesheets(updated);
    saveTimesheets(updated);
    setComments(prev => {
      const next = { prev };
      delete next[timesheetId];
      return next;
    });
  };

  const weeklyRollup = timesheets.reduce((acc, ts) => {
    if (!acc[ts.candidateId]) {
      acc[ts.candidateId] = {
        name: ts.candidateName,
        totalHours: 0,
        weeklyBreakdown: {}
      };
    }

    if (!acc[ts.candidateId].weeklyBreakdown[ts.weekId]) {
      acc[ts.candidateId].weeklyBreakdown[ts.weekId] = 0;
    }

    if (ts.totalHours) {
      acc[ts.candidateId].totalHours += ts.totalHours;
      acc[ts.candidateId].weeklyBreakdown[ts.weekId] += ts.totalHours;
    }

    return acc;
  }, {});

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Timesheet Approvals</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Weekly Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(weeklyRollup).map(([candidateId, data]) => (
            <div key={candidateId} className="border rounded p-4 bg-white">
              <h4 className="font-medium">{data.name}</h4>
              <p className="text-gray-600">Total Hours: {data.totalHours.toFixed(1)}</p>
              {Object.entries(data.weeklyBreakdown).map(([weekId, hours]) => (
                <p key={weekId} className="text-sm text-gray-500">
                  Week {weekId}: {hours.toFixed(1)} hours
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Date</th>
              <th className="p-2">Employee</th>
              <th className="p-2">Job</th>
              <th className="p-2">Hours</th>
              <th className="p-2">Notes</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {timesheets
              .filter(ts => ts.status === "Submitted")
              .map(ts => (
                <tr key={ts.id} className="border-t">
                  <td className="p-2">{ts.date}</td>
                  <td className="p-2">{ts.candidateName}</td>
                  <td className="p-2">{ts.jobTitle}</td>
                  <td className="p-2">
                    {ts.totalHours}
                    {auditTimesheet(ts).length > 0 && (
                      <div className="text-sm text-orange-600 mt-1">
                        {auditTimesheet(ts).map((flag, i) => (
                          <div key={i}>{flag}</div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={comments[ts.id] || ''}
                      onChange={(e) => setComments(prev => ({
                        prev,
                        [ts.id]: e.target.value
                      }))}
                      className="border p-1 w-full"
                      placeholder="Add comment"
                    />
                  </td>
                  <td className="p-2">{ts.status}</td>
                  <td className="p-2 space-x-2">
                    <button
                      onClick={() => handleApproval(ts.id, "Approved")}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => handleApproval(ts.id, "Rejected")}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      ✗
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}