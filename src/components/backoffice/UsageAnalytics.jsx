
import React, { useEffect, useState } from "react";

export default function UsageAnalytics() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fakeStats = {
      users: 42,
      loginsToday: 17,
      candidatesSubmitted: 8,
      docsUploaded: 12,
      invoicesGenerated: 6,
    };
    setStats(fakeStats);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Usage Analytics</h2>
      <ul className="space-y-2">
        <li>👥 Total Users: {stats.users}</li>
        <li>🔐 Logins Today: {stats.loginsToday}</li>
        <li>📤 Candidates Submitted: {stats.candidatesSubmitted}</li>
        <li>📁 Docs Uploaded: {stats.docsUploaded}</li>
        <li>🧾 Invoices Generated: {stats.invoicesGenerated}</li>
      </ul>
    </div>
  );
}
