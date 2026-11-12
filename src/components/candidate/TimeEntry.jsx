import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { getStoredTimesheets, saveTimesheets } from '../../data/mockTimesheets';
import TimesheetEntry from "./TimesheetEntry"; // Import the new component

export default function TimeEntry() {
  const [timesheets, setTimesheets] = useState([]);
  const [activeTimesheet, setActiveTimesheet] = useState(null);
  const candidateId = "cand123"; // Mock ID

  useEffect(() => {
    const stored = getStoredTimesheets();
    setTimesheets(stored.filter(ts => ts.candidateId === candidateId));
  }, []);

  const clockIn = () => {
    const now = new Date();
    const newTimesheet = {
      id: `ts${Date.now()}`,
      candidateId,
      candidateName: "Emily Tran",
      jobId: "job001",
      jobTitle: "Warehouse Associate",
      date: format(now, 'yyyy-MM-dd'),
      clockIn: format(now, 'HH:mm'),
      status: "In Progress",
      weekId: `${format(now, 'yyyy')}-W${format(now, 'ww')}`
    };
    setActiveTimesheet(newTimesheet);
    const updated = [timesheets, newTimesheet];
    setTimesheets(updated);
    saveTimesheets(updated);
  };

  const clockOut = () => {
    if (!activeTimesheet) return;

    const now = new Date();
    const clockOut = format(now, 'HH:mm');
    const updated = timesheets.map(ts => {
      if (ts.id === activeTimesheet.id) {
        const hours = calculateHours(ts.clockIn, clockOut, ts.breakStart, ts.breakEnd);
        return {
          ts,
          clockOut,
          totalHours: hours,
          status: "Submitted"
        };
      }
      return ts;
    });
    setTimesheets(updated);
    saveTimesheets(updated);
    setActiveTimesheet(null);
  };

  const toggleBreak = (type) => {
    if (!activeTimesheet) return;

    const now = new Date();
    const time = format(now, 'HH:mm');
    const updated = timesheets.map(ts => {
      if (ts.id === activeTimesheet.id) {
        return {
          ts,
          [type === 'start' ? 'breakStart' : 'breakEnd']: time
        };
      }
      return ts;
    });
    setTimesheets(updated);
    saveTimesheets(updated);
  };

  const calculateHours = (start, end, breakStart, breakEnd) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    let total = (endHour - startHour) + (endMin - startMin) / 60;

    if (breakStart && breakEnd) {
      const [breakStartHour, breakStartMin] = breakStart.split(':').map(Number);
      const [breakEndHour, breakEndMin] = breakEnd.split(':').map(Number);
      const breakTime = (breakEndHour - breakStartHour) + (breakEndMin - breakStartMin) / 60;
      total -= breakTime;
    }

    return Math.round(total * 100) / 100;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Time Entry</h2>

      <div className="mb-6">
        <button
          onClick={clockIn}
          disabled={activeTimesheet}
          className={`px-4 py-2 rounded ${
            activeTimesheet ? 'bg-gray-300' : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          Clock In
        </button>

        {activeTimesheet && (
          <div className="space-x-4 mt-4">
            <button
              onClick={() => toggleBreak('start')}
              disabled={activeTimesheet?.breakStart}
              className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Start Break
            </button>
            <button
              onClick={() => toggleBreak('end')}
              disabled={!activeTimesheet?.breakStart || activeTimesheet?.breakEnd}
              className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              End Break
            </button>
            <button
              onClick={clockOut}
              className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white"
            >
              Clock Out
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Date</th>
              <th className="p-2">Job</th>
              <th className="p-2">Clock In</th>
              <th className="p-2">Break</th>
              <th className="p-2">Clock Out</th>
              <th className="p-2">Hours</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.map(ts => (
              <tr key={ts.id} className="border-t">
                <td className="p-2">{ts.date}</td>
                <td className="p-2">{ts.jobTitle}</td>
                <td className="p-2">{ts.clockIn}</td>
                <td className="p-2">
                  {ts.breakStart && ts.breakEnd
                    ? `${ts.breakStart} - ${ts.breakEnd}`
                    : 'No break'}
                </td>
                <td className="p-2">{ts.clockOut || '-'}</td>
                <td className="p-2">{ts.totalHours || '-'}</td>
                <td className="p-2">{ts.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TimesheetEntry /> {/* Add the new timesheet entry component */}
    </div>
  );
}

import React, { useState } from "react";

export function TimesheetEntry() {
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");

  const submit = () => {
    const timesheets = JSON.parse(localStorage.getItem("mockTimesheets")) || [];
    const newEntry = {
      date: new Date().toISOString().split("T")[0],
      clockIn,
      clockOut,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem("mockTimesheets", JSON.stringify([timesheets, newEntry]));
    alert("✅ Time submitted");
  };

  return (
    <div className="p-4 mt-8"> {/* Added margin top for spacing */}
      <h2 className="text-xl font-bold mb-4">Simple Timesheet Entry</h2>
      <input
        className="border p-2 mb-2 block w-full"
        placeholder="Clock In (e.g. 08:00)"
        value={clockIn}
        onChange={(e) => setClockIn(e.target.value)}
      />
      <input
        className="border p-2 mb-2 block w-full"
        placeholder="Clock Out (e.g. 17:00)"
        value={clockOut}
        onChange={(e) => setClockOut(e.target.value)}
      />
      <button onClick={submit} className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit Time
      </button>
    </div>
  );
}