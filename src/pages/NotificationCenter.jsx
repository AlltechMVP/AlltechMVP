
import { notifications } from "../data/notifications";
import { useState } from "react";

function NotificationCenter() {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? notifications : notifications.filter(n => n.type === filter);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notification Center</h1>

      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 border rounded ${filter === "All" ? "bg-blue-500 text-white" : ""}`}
          onClick={() => setFilter("All")}
        >
          All
        </button>
        <button
          className={`px-4 py-2 border rounded ${filter === "Admin" ? "bg-blue-500 text-white" : ""}`}
          onClick={() => setFilter("Admin")}
        >
          Admin
        </button>
        <button
          className={`px-4 py-2 border rounded ${filter === "Client" ? "bg-blue-500 text-white" : ""}`}
          onClick={() => setFilter("Client")}
        >
          Client
        </button>
      </div>

      <ul className="space-y-4">
        {filtered.map((n) => (
          <li key={n.id} className="border rounded p-4 shadow">
            <h2 className="text-xl font-semibold">{n.title}</h2>
            <p className="text-sm text-gray-600">{n.timestamp}</p>
            <p className="mt-2">{n.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationCenter;
