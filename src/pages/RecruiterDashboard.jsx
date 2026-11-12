import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const RecruiterDashboard = () => {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase.from("candidates").select("*");
      if (!error) setCandidates(data);
    };
    fetchCandidates();
  }, []);

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Status"];
    const rows = candidates.map((c) => [
      c.name,
      c.email,
      c.phone || "",
      c.status || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, rows].map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "candidates.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  //Modified candidate rendering logic to use the data fetched from Supabase
  const renderCandidates = () => {
    if (candidates.length === 0) {
      return (
        <div className="p-6">
          <p className="text-center text-gray-500">No candidates available.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {candidates.map((candidate, index) => (
          <div key={candidate.id || index} className="border rounded-lg shadow-sm p-4 bg-white">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-grow">
                <h3 className="font-semibold text-lg">{candidate.name}</h3>
                <p className="text-gray-600">{candidate.email}</p>
                {candidate.phone && (
                  <p className="text-gray-600">{candidate.phone}</p>
                )}
                <p className="text-gray-700">
                  <span className="text-sm text-gray-600">Status: </span>
                  {candidate.status || "—"}
                </p>
                {candidate.job_title && (
                  <p className="text-gray-700">{candidate.job_title}</p>
                )}
                {candidate.resume_url && (
                  <a
                    className="text-sm text-blue-600 underline"
                    href={candidate.resume_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Resume
                  </a>
                )}
                {typeof candidate.completedSteps === "number" && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">
                      Onboarding Progress: {candidate.completedSteps}/4
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(candidate.completedSteps / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {candidate.note && (
                  <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    Note: {candidate.note}
                  </p>
                )}
              </div>
              {typeof candidate.ready === "boolean" && (
                <span className="text-2xl ml-4">
                  {candidate.ready ? "✅" : "❌"}
                </span>
              )}
            </div>

            {/*Removed timesheet related section*/}
          </div>
        ))}
      </div>
    );
  };


  return (
    <div className="p-6 h-full overflow-y-auto max-h-[80vh]">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
        <button
          onClick={exportCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Export to CSV
        </button>
      </div>
      {renderCandidates()}
    </div>
  );
};

export default RecruiterDashboard;