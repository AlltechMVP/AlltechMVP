import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { fetchApplications, isRlsDenied } from "@/lib/pipeline";
import { getCandidates, getJobById } from "@/utils/storage";

const RecruiterDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  // Applications still in Applied status: someone applied (or was
  // submitted) and nobody has started screening them yet. The banner
  // clears itself as the team moves them on — no seen/ack flag needed.
  const [newApplicants, setNewApplicants] = useState([]);

  useEffect(() => {
    const fetchCandidates = async () => {
      const { data, error } = await supabase.from("candidates").select("*");
      if (!error) setCandidates(data);
    };
    fetchCandidates();
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const apps = await fetchApplications();
        if (!mounted) return;
        const fresh = apps
          .filter((a) => a.status === "Applied")
          .sort(
            (a, b) =>
              new Date(b.submittedAt || b.lastActionAt || 0) -
              new Date(a.submittedAt || a.lastActionAt || 0)
          );
        setNewApplicants(fresh);
      } catch (err) {
        // An RLS denial is not an outage — show nothing, never fall back
        // to the unscoped demo store for a denied reader.
        if (isRlsDenied(err)) return;
        if (!mounted) return;
        // Offline fallback: demo-store pipeline rows (job via the order).
        const demo = getCandidates()
          .filter((c) => (c.status || "") === "Applied")
          .map((c) => {
            const job = c.submittedJobId ? getJobById(c.submittedJobId) : null;
            const last = (c.statusHistory || []).slice(-1)[0];
            return {
              id: c.id,
              name: c.name,
              jobTitle: job?.title || "—",
              clientName: job?.client_name || "—",
              status: "Applied",
              submittedAt: c.submittedAt || last?.at || null,
            };
          })
          .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));
        setNewApplicants(demo);
      }
    })();
    return () => {
      mounted = false;
    };
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
      {newApplicants.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-amber-900">
              {newApplicants.length} new applicant{newApplicants.length === 1 ? "" : "s"} waiting for review
            </h2>
            <Link to="/recruiter/board" className="text-sm text-blue-600 underline">
              View pipeline →
            </Link>
          </div>
          <ul className="mt-2 space-y-1">
            {newApplicants.slice(0, 5).map((a) => (
              <li key={a.id} className="text-sm text-amber-800">
                {a.name} — {a.jobTitle}
                {a.clientName && a.clientName !== "—" ? ` · ${a.clientName}` : ""}
                {a.submittedAt ? ` — applied ${new Date(a.submittedAt).toLocaleDateString()}` : ""}
              </li>
            ))}
          </ul>
          {newApplicants.length > 5 && (
            <p className="mt-1 text-xs text-amber-700">
              + {newApplicants.length - 5} more in the pipeline
            </p>
          )}
        </div>
      )}
      {renderCandidates()}
    </div>
  );
};

export default RecruiterDashboard;