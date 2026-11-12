
import React, { useState } from "react";

const NotificationsBell = () => {
  const [open, setOpen] = useState(false);

  const notifications = [
    "New candidate submitted",
    "Invoice ready for review", 
    "Timesheet submitted by John Doe",
  ];

  return (
    <div className="fixed top-4 right-6 z-50">
      <button onClick={() => setOpen(!open)} className="relative">
        <span className="absolute -top-1 -right-1 bg-red-600 text-xs text-white px-1 rounded-full">3</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C8.67 6.165 8 7.388 8 9v5.159c0 .538-.214 1.055-.595 1.436L6 17h9z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg p-4">
          <h3 className="font-semibold mb-2">Notifications</h3>
          <ul className="text-sm space-y-2">
            {notifications.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
