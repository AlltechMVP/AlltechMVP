
import React, { useState } from "react";

// Mapped department keywords to GL codes
const GL_RULES = {
  sales: "5000",
  hr: "5100",
  tech: "5200"
};

const getGLCode = (dept) => {
  if (!dept) return "";
  const lower = dept.toLowerCase();
  for (const key in GL_RULES) {
    if (lower.includes(key)) return GL_RULES[key];
  }
  return "Unmapped";
};

export default function GLMappingAssistant() {
  const [entries, setEntries] = useState([{ payCode: "", department: "" }]);

  const updateField = (index, field, value) => {
    const updated = [entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addRow = () => {
    setEntries([entries, { payCode: "", department: "" }]);
  };

  const removeRow = (index) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">GL Mapping Assistant</h1>
      <table className="w-full border rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Pay Code</th>
            <th className="p-2 border">Department</th>
            <th className="p-2 border">Suggested GL Code</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((row, i) => (
            <tr key={i} className="bg-white">
              <td className="border p-2">
                <label className="sr-only" htmlFor={`payCode-${i}`}>Pay Code</label>
                <input
                  id={`payCode-${i}`}
                  className="w-full border rounded px-2 py-1"
                  value={row.payCode}
                  onChange={(e) => updateField(i, "payCode", e.target.value)}
                  aria-label={`Pay Code for row ${i + 1}`}
                />
              </td>
              <td className="border p-2">
                <label className="sr-only" htmlFor={`dept-${i}`}>Department</label>
                <input
                  id={`dept-${i}`}
                  className="w-full border rounded px-2 py-1"
                  value={row.department}
                  onChange={(e) => updateField(i, "department", e.target.value)}
                  aria-label={`Department for row ${i + 1}`}
                />
              </td>
              <td className="border p-2 text-center">
                {getGLCode(row.department)}
              </td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => removeRow(i)}
                  className="text-sm text-red-600 hover:text-red-800"
                  aria-label={`Remove row ${i + 1}`}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={addRow}
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add Row
      </button>
    </div>
  );
}
