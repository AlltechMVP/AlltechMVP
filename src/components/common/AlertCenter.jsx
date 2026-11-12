
import React, { useEffect, useState } from "react";

export default function AlertCenter() {
  const [alerts, setAlerts] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("globalAlerts")) || [];
    setAlerts(stored);
  }, []);

  const addAlert = () => {
    if (!message.trim()) return;
    
    const newAlert = {
      id: Date.now(),
      message,
      postedAt: new Date().toISOString(),
      severity: "info"
    };
    const updated = [newAlert, alerts];
    setAlerts(updated);
    localStorage.setItem("globalAlerts", JSON.stringify(updated));
    setMessage("");
  };

  const removeAlert = (id) => {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    localStorage.setItem("globalAlerts", JSON.stringify(updated));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Global Alerts</h2>
      <div className="flex gap-2 mb-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addAlert()}
          className="border p-2 w-full rounded"
          placeholder="Enter alert message"
        />
        <button 
          onClick={addAlert} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={!message.trim()}
        >
          Post
        </button>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className="flex justify-between items-start border p-3 rounded shadow-sm bg-yellow-50">
            <div className="flex-1">
              <div className="font-semibold">{alert.message}</div>
              <div className="text-sm text-gray-600">
                {new Date(alert.postedAt).toLocaleString()}
              </div>
            </div>
            <button 
              onClick={() => removeAlert(alert.id)}
              className="text-gray-500 hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
