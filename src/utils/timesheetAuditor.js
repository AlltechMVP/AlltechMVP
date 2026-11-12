
export function auditTimesheet(entry) {
  const flags = [];
  if (entry.totalHours > 12) flags.push("⚠️ Unusually long shift");
  if (!entry.breakStart && entry.totalHours > 6) flags.push("⚠️ No meal break");
  if (entry.notes && entry.notes.toLowerCase().includes("manual")) flags.push("📝 Manual entry");
  return flags;
}

export const calculatePayPeriod = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-W${String(Math.ceil(d.getDate() / 7)).padStart(2, '0')}`;
};
