// Lightweight, dependency-free GPX waypoint parser.
//
// Only `<wpt>` waypoints are extracted (routes and tracks are ignored). A
// waypoint contributes a point if it carries valid numeric `lat`/`lon`
// attributes; its optional `<name>` child becomes the Aufnahme name.

export type GpxWaypoint = {
  lat: number;
  lon: number;
  name?: string;
};

/** Matches both `<wpt …>…</wpt>` and the self-closing `<wpt … />` form. */
const WPT_RE = /<wpt\b([^>]*?)(?:\/>|>([\s\S]*?)<\/wpt>)/gi;
const LAT_RE = /\blat\s*=\s*["']([^"']+)["']/i;
const LON_RE = /\blon\s*=\s*["']([^"']+)["']/i;
const NAME_RE = /<name\b[^>]*>([\s\S]*?)<\/name>/i;

/** Decodes the handful of XML entities that can appear in a `<name>`. */
function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

/**
 * Parses all valid `<wpt>` waypoints from a GPX document. Entries with
 * missing or non-numeric coordinates are skipped.
 */
export function parseGpxWaypoints(xml: string): GpxWaypoint[] {
  const waypoints: GpxWaypoint[] = [];

  for (const match of xml.matchAll(WPT_RE)) {
    const attrs = match[1] ?? "";
    const body = match[2] ?? "";

    const latStr = attrs.match(LAT_RE)?.[1];
    const lonStr = attrs.match(LON_RE)?.[1];
    if (latStr == null || lonStr == null) continue;

    const lat = Number(latStr);
    const lon = Number(lonStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const nameRaw = body.match(NAME_RE)?.[1];
    const name = nameRaw != null ? decodeXmlEntities(nameRaw).trim() : "";

    waypoints.push(name ? { lat, lon, name } : { lat, lon });
  }

  return waypoints;
}
