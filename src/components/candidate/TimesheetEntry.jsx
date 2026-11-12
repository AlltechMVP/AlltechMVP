import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { fetchAssignments } from "@/lib/pipeline";

// Slice 7: candidate time entry, rewritten. The old version was broken in
// four ways — `const newHours = [hours]` nested the hours array instead of
// copying it, `candidate_id` was set to the auth uid (not a
// public.candidates row — the FK now points at public.candidates), hours
// were submitted as strings, and it alerted success even when the insert
// failed. This version resolves the candidate's person row by the signed-in
// user's email (a candidate can read only their own row), offers only
// their own Active assignments, takes a week-ending date (defaulting to
// this week's Friday), submits numeric hours, and surfaces real errors
// in the UI instead of alerting success.
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Friday of the Mon-Sun week containing today (the week-ending date the
// demo seed uses for its timesheets).
function fridayOfCurrentWeek() {
  const d = new Date();
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const offset = day === 0 ? -2 : 5 - day;
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

const TimesheetEntry = () => {
  const [hours, setHours] = useState(Array(7).fill(""));
  const [personId, setPersonId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState("");
  const [weekEnding, setWeekEnding] = useState(fridayOfCurrentWeek());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      const userEmail = (user?.email || "").trim().toLowerCase();
      if (!userEmail) {
        setLoadError("You must be signed in to enter time.");
        setLoading(false);
        return;
      }
      // The candidate's person row is resolved by EMAIL (the signed JWT
      // email claim). A candidate can read only their own row.
      const { data: person, error: personError } = await supabase
        .from("candidates")
        .select("id")
        .eq("email", userEmail)
        .single();
      if (!mounted) return;
      if (personError || !person) {
        setLoadError("We couldn't find your candidate record — apply to a job first, then enter time.");
        setLoading(false);
        return;
      }
      setPersonId(person.id);
      // The candidate's own assignments. RLS already scopes the read;
      // filter client-side too so only their rows are ever offered.
      let mine = [];
      try {
        const all = await fetchAssignments();
        mine = (all || []).filter((a) => a.candidateId === person.id && a.status === "Active");
      } catch {
        if (!mounted) return;
        setLoadError("Could not load your assignments. Please try again.");
        setLoading(false);
        return;
      }
      if (!mounted) return;
      setAssignments(mine);
      if (mine.length > 0) setAssignmentId(String(mine[0].id));
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  const handleChange = (index, value) => {
    const newHours = [...hours];
    newHours[index] = value;
    setHours(newHours);
  };

  const totalHours = hours.reduce((sum, h) => {
    const n = parseFloat(h);
    return sum + (Number.isFinite(n) && n > 0 ? n : 0);
  }, 0);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitError("");
    if (!personId || !assignmentId || !weekEnding) {
      setSubmitError("Pick an assignment and a week ending first.");
      return;
    }
    const numeric = hours.map((h) => {
      const n = parseFloat(h);
      return Number.isFinite(n) && n >= 0 ? n : 0;
    });
    setSubmitting(true);
    const { error } = await supabase.from("timesheets").insert([
      {
        candidate_id: personId,
        assignment_id: Number(assignmentId),
        week_ending: weekEnding,
        hours_mon: numeric[0],
        hours_tue: numeric[1],
        hours_wed: numeric[2],
        hours_thu: numeric[3],
        hours_fri: numeric[4],
        hours_sat: numeric[5],
        hours_sun: numeric[6],
        status: "Submitted",
        payroll_status: "Not Ready",
        client_approval_status: "Not Submitted",
      },
    ]);
    setSubmitting(false);
    if (error) {
      setSubmitError(`Could not submit the timesheet: ${error.message}`);
      return;
    }
    setSubmitted(true);
  };

  const resetForm = () => {
    setHours(Array(7).fill(""));
    setWeekEnding(fridayOfCurrentWeek());
    setSubmitted(false);
    setSubmitError("");
  };

  if (loading) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Timesheet Entry</h1>
        <p className="text-sm text-gray-500">Loading your assignments…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Timesheet Entry</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">{loadError}</div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-xl font-bold mb-4">Timesheet Entry</h1>
        <p className="text-sm text-gray-600">You have no active assignments yet — time entry opens once a recruiter creates one for you.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Timesheet Entry</h1>
      {submitted ? (
        <div>
          <p className="text-green-600 font-semibold">Timesheet submitted for approval.</p>
          <button
            type="button"
            onClick={resetForm}
            className="mt-4 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm font-medium"
          >
            Enter another week
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="block text-sm font-medium">Assignment</span>
            <select
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
            >
              {assignments.map((a) => (
                <option key={a.id} value={String(a.id)}>
                  {a.jobTitle} — {a.clientName || ""}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="block text-sm font-medium">Week Ending (Friday)</span>
            <input
              type="date"
              value={weekEnding}
              onChange={(e) => setWeekEnding(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
              required
            />
          </label>
          {DAYS.map((day, i) => (
            <div key={day}>
              <label className="block text-sm font-medium">{day}</label>
              <input
                type="number"
                min="0"
                max="24"
                step="0.5"
                value={hours[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                className="w-full border px-3 py-1 rounded"
              />
            </div>
          ))}
          <p className="text-sm text-gray-600">Total: <span className="font-medium">{totalHours}h</span></p>
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">{submitError}</div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded w-full disabled:bg-blue-300"
          >
            {submitting ? "Submitting…" : "Submit Timesheet"}
          </button>
        </form>
      )}
    </div>
  );
};

export default TimesheetEntry;
