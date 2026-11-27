import { format, startOfWeek, addDays } from 'date-fns';

// Pure scheduling helpers for the Scheduler page (live assignments only —
// no mock events). An assignment covers every day from its start date
// through its end date; with no end date it is ongoing and covers every
// day from its start date on. Only Active assignments are scheduled.

export function toISODate(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// The Active assignments working on `day` (a Date, or a 'YYYY-MM-DD'
// string). Rows carry startDate/endDate as 'YYYY-MM-DD' date strings, so
// plain string comparison is exact — no timezone shifting.
export function assignmentsForDay(assignments, day) {
  const iso = typeof day === 'string' ? day : toISODate(day);
  return (assignments || []).filter((a) => {
    if (!a || a.status !== 'Active') return false;
    if (!a.startDate) return false;
    if (a.startDate > iso) return false;
    if (a.endDate && a.endDate < iso) return false;
    return true;
  });
}

// The 42 days of the month grid containing `viewDate`: the 6 weeks
// starting on the Sunday of the week containing the 1st, so every month
// renders a full rectangle (days outside the month are dimmed by the page).
export function monthGridDays(viewDate) {
  const first = startOfWeek(new Date(viewDate.getFullYear(), viewDate.getMonth(), 1));
  return Array.from({ length: 42 }, (_, i) => addDays(first, i));
}

export function weekDays(viewDate) {
  const start = startOfWeek(viewDate);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function formatDayISO(day) {
  return format(day, 'yyyy-MM-dd');
}
