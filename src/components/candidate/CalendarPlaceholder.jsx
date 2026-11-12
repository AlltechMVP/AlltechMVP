
import React from 'react';

export default function CalendarPlaceholder() {
  const mockAssignments = [
    { day: "Monday", job: "Warehouse", candidate: "Jane", time: "10:00" },
    { day: "Tuesday", job: "Cleanup", candidate: "Luis", time: "13:00" }
  ];

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Weekly Schedule</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              {weekDays.map(day => (
                <th key={day} className="border p-3 bg-gray-50">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map(hour => (
              <tr key={hour}>
                {weekDays.map(day => {
                  const assignment = mockAssignments.find(
                    a => a.day === day && parseInt(a.time) === hour
                  );
                  return (
                    <td key={`${day}-${hour}`} className="border p-3">
                      {assignment ? (
                        <div className="bg-blue-100 p-2 rounded">
                          <div className="font-bold">{assignment.job}</div>
                          <div className="text-sm">{assignment.candidate}</div>
                          <div className="text-xs">{assignment.time}</div>
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm">
                          {`${hour}:00`}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
