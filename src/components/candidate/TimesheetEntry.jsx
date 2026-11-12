import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { fetchAssignments, syncTimesheetToSupabase } from "@/lib/pipeline";
import {
  getTimesheets, setTimesheets, getAssignments,
  applyTimesheetCompliance, uid, now,
} from "@/utils/storage";

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
// It writes to the DEMO store (the canonical write path, same as the
// timekeeping Form) and syncs up via syncTimesheetToSupabase — it must
// NOT insert directly into Supabase: a direct row has no legacy_id, so
// the reconcile creates demo twins for it and those twins sync up as NEW
// Supabase rows (one submission became three timesheets).
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

// The 7 dates of the Mon-Sun week ending on `weekEnding`, same convention
// as the timekeeping Form (entries[0] is Monday, entries[6] is the
// week-ending date).
function generateWeekDates(weekEnding) {
  if (!weekEnding) return [];
  const end = new Date(weekEnding + "T00:00:00");
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
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
        const demoRows = getAssignments();
        mine = (all || [])
          .filter((a) => a.candidateId === person.id && a.status === "Active")
          .map((a) => ({
            ...a,
            // The demo store is the canonical write path: the timesheet
            // row references the DEMO assignment id, and the sync resolves
            // it to the Supabase row. legacyId is the demo id for
            // synced/seeded assignments; fall back to the demo row whose
            // supabaseAssignmentId matches.
            demoAssignmentId: a.legacyId
              || demoRows.find((d) => String(d.supabaseAssignmentId) === String(a.id))?.id
              || null,
          }))
          .filter((a) => a.demoAssignmentId);
      } catch {
        if (!mounted) return;
        setLoadError("Could not load your assignments. Please try again.");
        setLoading(false);
        return;
      }
      if (!mounted) return;
      setAssignments(mine);
      if (mine.length > 0) setAssignmentId(String(mine[0].demoAssignmentId));
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
    if (numeric.reduce((s, h) => s + h, 0) === 0) {
      setSubmitError("Enter at least some hours before submitting.");
      return;
    }
    // One timesheet per assignment + week: a second submit for the same
    // week is a duplicate, not a new timesheet.
    const existing = getTimesheets().find(
      (t) => String(t.assignmentId) === String(assignmentId) && t.weekEnding === weekEnding
    );
    if (existing) {
      setSubmitError("A timesheet for this assignment and week already exists.");
      return;
    }
    setSubmitting(true);
    // Write to the DEMO store (the canonical write path) and sync up —
    // the same pattern the timekeeping Form uses. Inserting directly into
    // Supabase created duplicates: the direct row had no legacy_id, so
    // the reconcile created demo twins for it and those twins synced up
    // as NEW Supabase rows. applyTimesheetCompliance flips
    // clientApprovalStatus to 'Submitted' so the client can approve it.
    const timestamp = now();
    const dates = generateWeekDates(weekEnding);
    const row = {
      id: uid(),
      assignmentId,
      weekEnding,
      entries: dates.map((d, i) => ({ date: d, hours: numeric[i] })),
      totalHours: numeric.reduce((s, h) => s + h, 0),
      status: "Submitted",
      clientApprovalStatus: "Not Submitted",
      payrollStatus: "Not Ready",
      exceptions: [],
      compliance: {},
      submittedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    applyTimesheetCompliance(row);
    const all = getTimesheets();
    all.push(row);
    setTimesheets(all);
    // Fire-and-forget sync (never throws); the demo write above already
    // succeeded, and the recruiter/client read it from Supabase.
    syncTimesheetToSupabase(row);
    setSubmitting(false);
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
                <option key={a.demoAssignmentId} value={String(a.demoAssignmentId)}>
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
