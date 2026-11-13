/** "1 Aufnahme" / "3 Aufnahmen". */
export function count(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** Display name of an Aufnahme: "Aufnahme 3" or "Aufnahme 3 – WP12". */
export function aufnahmeTitle(a: {
  id: number;
  nummer?: number | null;
  name?: string | null;
}): string {
  return `Aufnahme ${a.nummer ?? a.id}${a.name ? ` – ${a.name}` : ""}`;
}
