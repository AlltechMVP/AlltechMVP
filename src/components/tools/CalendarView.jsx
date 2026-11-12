
import React from "react";

const mockEvents = [
  { date: "2025-05-13", type: "Assignment", label: "Start: ABC Warehouse" },
  { date: "2025-05-17", type: "Payday", label: "Weekly Payroll Processed" },
];

export default function CalendarView() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Calendar View</h2>
      <ul className="space-y-3">
        {mockEvents.map((e, i) => (
          <li key={i} className="border p-3 rounded shadow-sm">
            <div className="font-semibold">{e.date}</div>
            <div>{e.label}</div>
            <div className="text-sm text-gray-500">{e.type}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
