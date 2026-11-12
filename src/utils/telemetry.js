export function reportError(err, info) {
  if (import.meta.env.MODE !== 'production') return;
  try {
    console.warn('[telemetry] error', err, info);
  } catch (_) {}
}
