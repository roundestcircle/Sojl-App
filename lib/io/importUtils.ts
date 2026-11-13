/**
 * Small helpers shared by the ZIP and GPX importers. Pure (no Expo imports).
 */

/** Fallback when a file name yields no usable campaign name. */
const DEFAULT_CAMPAIGN_NAME = "Importierte Kampagne";

/**
 * Derives a campaign name from a picked file name by removing exactly one
 * extension and trimming: "Exkursion 2.5.gpx" → "Exkursion 2.5".
 */
export function campaignNameFromFile(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "").trim() || DEFAULT_CAMPAIGN_NAME;
}

/**
 * Formats a date as UTC in SQLite's `datetime('now')` format
 * ("YYYY-MM-DD HH:MM:SS"), matching the default of the `erstellt_am` columns.
 */
export function sqliteTimestamp(date: Date = new Date()): string {
  return date.toISOString().slice(0, 19).replace("T", " ");
}
