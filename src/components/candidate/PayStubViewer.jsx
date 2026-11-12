
import React, { useEffect, useState } from "react";

export default function PayStubViewer() {
  const [stubs, setStubs] = useState([]);

  useEffect(() => {
    const mock = [
      {
        week: "2025-05-10",
        hours: 40,
        rate: 18,
        gross: 720,
        taxes: 144,
        net: 576,
      },
    ];
    setStubs(mock);
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Pay Stub Viewer</h2>
      {stubs.map((s, i) => (
        <div key={i} className="border p-3 mb-3 rounded shadow-sm">
          <div><strong>Week:</strong> {s.week}</div>
          <div><strong>Hours:</strong> {s.hours}</div>
          <div><strong>Rate:</strong> ${s.rate}/hr</div>
          <div><strong>Gross Pay:</strong> ${s.gross}</div>
          <div><strong>Taxes:</strong> ${s.taxes}</div>
          <div><strong>Net Pay:</strong> ${s.net}</div>
        </div>
      ))}
    </div>
  );
}
