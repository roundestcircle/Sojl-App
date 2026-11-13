/**
 * Formats a stored timestamp for display as local "YYYY-MM-DD HH:MM".
 *
 * SQLite's datetime('now') stores UTC without a zone marker
 * ("2026-05-01 22:30:00"), so the value is interpreted as UTC and converted
 * to the device's local time. Unparseable input is returned unchanged.
 */
export function formatDate(stored: string): string {
  const m = stored.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return stored;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
