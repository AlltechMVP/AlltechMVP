// One money format for the whole app: $18,300.00 — thousands separators
// included. (PayrollView and the Back Office Dashboard used toFixed(2),
// which renders $18300.00; AR Aging already formatted with commas via its
// local fmt — it now uses this too.)
export function formatMoney(v) {
  const n = Number(v) || 0;
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
