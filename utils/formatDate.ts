/** Formats an ISO datetime string to "YYYY-MM-DD HH:MM" for display. */
export function formatDate(iso: string): string {
  return iso.replace("T", " ").slice(0, 16);
}
