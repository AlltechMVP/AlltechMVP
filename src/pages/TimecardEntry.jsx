import React from "react";
import TimesheetEntry from "@/components/candidate/TimesheetEntry.jsx";

// Slice 7: the routed /timekeeping/entry page now renders the real
// candidate timesheet entry (Supabase-backed, own assignments only)
// instead of the old stub, which saved nothing.
export default function TimecardEntry() {
  return <TimesheetEntry />;
}
