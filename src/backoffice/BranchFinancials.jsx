
import React, { useEffect, useState } from "react";
import { hasAccess } from "../utils/roleUtils";

export default function BranchFinancials() {
  const [summaries, setSummaries] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")); // mock current user

  if (!hasAccess(user, "admin")) {
    return <div className="p-4 text-red-600">Unauthorized</div>;
  }

  useEffect(() => {
    const mock = [
      { branch: "DFW", revenue: 5000, payroll: 3500 },
      { branch: "Austin", revenue: 3000, payroll: 2200 },
    ];
    setSummaries(mock);
  }, []);

  const totals = summaries.reduce(
    (acc, b) => ({
      revenue: acc.revenue + b.revenue,
      payroll: acc.payroll + b.payroll,
    }),
    { revenue: 0, payroll: 0 }
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Branch Financial Rollups</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Branch</th>
            <th className="p-2">Revenue</th>
            <th className="p-2">Payroll</th>
            <th className="p-2">Gross Margin</th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((b, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{b.branch}</td>
              <td className="p-2">${b.revenue.toLocaleString()}</td>
              <td className="p-2">${b.payroll.toLocaleString()}</td>
              <td className="p-2">${(b.revenue - b.payroll).toLocaleString()}</td>
            </tr>
          ))}
          <tr className="border-t font-bold bg-gray-50">
            <td className="p-2">Total</td>
            <td className="p-2">${totals.revenue.toLocaleString()}</td>
            <td className="p-2">${totals.payroll.toLocaleString()}</td>
            <td className="p-2">${(totals.revenue - totals.payroll).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
