
import React, { useState } from "react";

export default function AIAssistant() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const simulateAIResponse = (input) => {
    if (input.toLowerCase().includes("upload")) {
      return "To upload documents, go to the onboarding section and select 'Document Uploader'.";
    }
    if (input.toLowerCase().includes("payroll")) {
      return "Payroll is managed weekly via the Back Office dashboard.";
    }
    return "Sorry, I don't recognize that yet. Please contact your system admin.";
  };

  const handleAsk = () => {
    const reply = simulateAIResponse(query);
    setResponse(reply);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Alltech AI Assistant (Sim)</h2>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border p-2 mb-2"
        placeholder="Ask me anything"
      />
      <button onClick={handleAsk} className="bg-blue-500 text-white px-4 py-2 rounded">
        Ask
      </button>
      {response && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <strong>Response:</strong> {response}
        </div>
      )}
    </div>
  );
}
