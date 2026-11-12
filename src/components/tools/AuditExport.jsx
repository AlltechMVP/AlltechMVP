
import React from "react";

export default function AuditExport() {
  const handleExport = () => {
    const logs = JSON.parse(localStorage.getItem("auditLog")) || [];
    const csv = logs.map(l => `${l.userId},${l.action},${l.module},${l.timestamp}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "audit-log.csv";
    link.click();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Export Audit Log</h2>
      <button
        onClick={handleExport}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Download CSV
      </button>
    </div>
  );
}
