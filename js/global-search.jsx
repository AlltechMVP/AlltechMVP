
import React, { useState, useEffect } from "react";
import { loadJobOrders } from "./jobOrders";
import { loadUsers } from "./users";

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!query) return setResults([]);
    const jobs = loadJobOrders();
    const users = loadUsers();
    const q = query.toLowerCase();
    const matches = [
      ...jobs.filter(j => j.title.toLowerCase().includes(q) || j.description?.toLowerCase().includes(q)),
      ...users.filter(u => u.name.toLowerCase().includes(q))
    ];
    setResults(matches);
  }, [query]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Global Search</h2>
      <input
        type="search"
        className="w-full border p-2 mb-4 rounded"
        placeholder="Search jobs and users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="space-y-2">
        {results.map((item, i) => (
          <div key={i} className="border p-3 rounded">
            <div className="font-medium">{item.title || item.name}</div>
            <div className="text-sm text-gray-600">{item.client || item.role || "N/A"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
