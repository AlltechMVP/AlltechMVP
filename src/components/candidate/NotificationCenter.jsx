
import React, { useEffect, useState } from "react";

export default function NotificationCenter() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const mock = [
      { message: "Upload your W-4 form.", date: "2025-05-12" },
      { message: "Timecard due Friday at 5PM.", date: "2025-05-13" },
    ];
    setAlerts(mock);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Candidate Notifications</h2>
      <ul className="space-y-2">
        {alerts.map((a, i) => (
          <li key={i} className="border p-2 rounded bg-yellow-50 shadow">
            <div>{a.message}</div>
            <div className="text-sm text-gray-500">{a.date}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
