
import React, { useState } from "react";

export default function SmartForms() {
  const [formData, setFormData] = useState({
    name: "",
    ssn: "",
    citizenship: "US",
    signature: "",
  });

  const handleSubmit = () => {
    const forms = JSON.parse(localStorage.getItem("submittedForms")) || [];
    const updated = [forms, { formData, submittedAt: new Date().toISOString() }];
    localStorage.setItem("submittedForms", JSON.stringify(updated));
    alert("✅ Forms submitted!");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Simulated W-4 / I-9</h2>
      <input
        className="border p-2 mb-2 block w-full"
        placeholder="Full Name"
        value={formData.name}
        onChange={(e) => setFormData({ formData, name: e.target.value })}
      />
      <input
        className="border p-2 mb-2 block w-full"
        placeholder="SSN"
        value={formData.ssn}
        onChange={(e) => setFormData({ formData, ssn: e.target.value })}
      />
      <select
        className="border p-2 mb-2 block w-full"
        value={formData.citizenship}
        onChange={(e) => setFormData({ formData, citizenship: e.target.value })}
      >
        <option value="US">US Citizen</option>
        <option value="GreenCard">Green Card</option>
        <option value="Visa">Work Visa</option>
      </select>
      <input
        className="border p-2 mb-2 block w-full"
        placeholder="Type Full Name to Sign"
        value={formData.signature}
        onChange={(e) => setFormData({ formData, signature: e.target.value })}
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit Forms
      </button>
    </div>
  );
}
