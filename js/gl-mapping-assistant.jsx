
import React, { useState } from "react";

const GL_CODES = {
  "payroll": "6001",
  "benefits": "6002",
  "office supplies": "7100",
  "rent": "7200",
  "utilities": "7300",
  "contractor": "6210",
  "insurance": "6400",
  "travel": "7400",
  "equipment": "7500"
};

export default function GLMappingAssistant() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const findMatch = () => {
    const input = text.toLowerCase();
    const match = Object.entries(GL_CODES).find(([key]) => input.includes(key));
    setResult(match ? { term: match[0], code: match[1] } : null);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">GL Code Assistant</h1>
      
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter invoice line item text..."
          className="w-full p-3 border rounded h-24"
        />
        
        <button
          onClick={findMatch}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Find GL Code
        </button>

        {result && (
          <div className="mt-4 p-4 border rounded bg-gray-50">
            <p className="font-medium">Matched Term: {result.term}</p>
            <p className="text-2xl font-bold mt-2">GL Code: {result.code}</p>
          </div>
        )}
      </div>
    </div>
  );
}
