/**
 * Parses numeric text from user input, the DB or a CSV cell.
 *
 * Accepts a German decimal comma ("5,5" → 5.5) and surrounding whitespace.
 * Returns null for null/undefined, "", "nb" and anything that is not a finite
 * number as a whole ("5 cm", "ca. 350"). Numbers are passed through when finite.
 *
 * Use this instead of parseFloat for every value a user may have typed:
 * parseFloat("5,5") silently returns 5.
 */
export function parseDecimal(
  s: string | number | null | undefined,
): number | null {
  if (s == null) return null;
  if (typeof s === "number") return Number.isFinite(s) ? s : null;
  const t = s.trim().replace(/,/g, ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}
