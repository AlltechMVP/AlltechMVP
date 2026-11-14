import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { fetchAssignments, syncTimesheetToSupabase } from "@/lib/pipeline";
import {
  getTimesheets, setTimesheets, getAssignments,
  applyTimesheetCompliance, uid, now, fridayOfCurrentWeek,
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

// Local-date formatter (YYYY-MM-DD). Using toISOString() here would mix a
// local-midnight date with a UTC output and shift the day for timezones
// ahead of UTC — the same class of bug the seeded-dates fix removed.
function toISODate(d) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// The 7 dates of the Mon-Sun week containing `weekEnding`, same convention
// as the timekeeping Form: entries[0] is Monday, entries[6] is Sunday, and
// weekEnding is the Friday of that week. NOT the 7 days ending on
// weekEnding (which would be Sat–Fri and store Monday's hours on a
// Saturday date).
function generateWeekDates(weekEnding) {
  if (!weekEnding) return [];
  const end = new Date(weekEnding + "T00:00:00");
  const monday = new Date(end);
  monday.setDate(end.getDate() - ((end.getDay() + 6) % 7));
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(toISODate(d));
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
  const [weekNote, setWeekNote] = useState("");

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
      if (mine.length > 0) {
        // Onboarding Slice 5: open on the assignment whose current-week
        // Draft is waiting (auto-created by ensureCurrentWeekTimesheets)
        // — the employee lands straight on the timecard to fill in.
        // The prefill effect below then loads that Draft's hours.
        const friday = fridayOfCurrentWeek();
        const sheets = getTimesheets();
        const withDraft = mine.find((a) => sheets.some(
          (t) => String(t.assignmentId) === String(a.demoAssignmentId)
            && t.weekEnding === friday && t.status === 'Draft'
        ));
        setAssignmentId(String((withDraft || mine[0]).demoAssignmentId));
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  // Prefill from the auto-created Draft for this assignment + week (see
  // ensureCurrentWeekTimesheets in storage.js): the candidate fills in
  // the Draft instead of starting blank. A non-Draft row for the week is
  // shown, not edited — the submit still rejects it as a duplicate.
  useEffect(() => {
    if (!assignmentId || !weekEnding) return;
    const existing = getTimesheets().find(
      (t) => String(t.assignmentId) === String(assignmentId) && t.weekEnding === weekEnding
    );
    if (existing && existing.status === "Draft") {
      setHours(Array.from({ length: 7 }, (_, i) => {
        const h = existing.entries?.[i]?.hours;
        return h ? String(h) : "";
      }));
      setWeekNote("A draft timecard is waiting for this week — fill in your hours and submit.");
    } else {
      setHours(Array(7).fill(""));
      setWeekNote(existing ? `A timesheet for this week is already ${existing.status}.` : "");
    }
  }, [assignmentId, weekEnding]);

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
    // week is a duplicate, not a new timesheet — UNLESS the existing row
    // is the auto-created Draft, which the candidate fills in and submits
    // (same row, same id) instead of creating a second timesheet.
    const existing = getTimesheets().find(
      (t) => String(t.assignmentId) === String(assignmentId) && t.weekEnding === weekEnding
    );
    if (existing && existing.status !== "Draft") {
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
    const entries = dates.map((d, i) => ({ date: d, hours: numeric[i] }));
    const total = numeric.reduce((s, h) => s + h, 0);
    const all = getTimesheets();
    let row;
    if (existing) {
      row = {
        ...existing,
        entries,
        totalHours: total,
        status: "Submitted",
        submittedAt: timestamp,
        updatedAt: timestamp,
      };
      applyTimesheetCompliance(row);
      const idx = all.findIndex((t) => t.id === existing.id);
      if (idx !== -1) all[idx] = row;
    } else {
      row = {
        id: uid(),
        assignmentId,
        weekEnding,
        entries,
        totalHours: total,
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
      all.push(row);
    }
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
          {weekNote && (
            <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded p-2">{weekNote}</p>
          )}
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
