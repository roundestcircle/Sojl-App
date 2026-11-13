// Lightweight, dependency-free GPX waypoint parser.
//
// Only `<wpt>` waypoints are extracted (routes and tracks are ignored). A
// waypoint contributes a point if it carries numeric `lat`/`lon` attributes
// inside the range UTM can represent (each becomes a UTM coordinate); its
// optional `<name>` child becomes the Aufnahme name. Comments are ignored,
// CDATA sections are unwrapped and namespace prefixes (`<gpx:wpt>`) accepted.

import { isUtmLatLon } from "@/lib/geo/coordinates";

export type GpxWaypoint = {
  lat: number;
  lon: number;
  name?: string;
};

/** Optional namespace prefix of a tag name, e.g. "gpx:". */
const NS = String.raw`(?:[\w.-]+:)?`;

/** Matches `<wpt …>…</wpt>` and the self-closing `<wpt … />`, with optional prefix. */
const WPT_RE = new RegExp(
  String.raw`<(${NS}wpt)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1\s*>)`,
  "gi",
);
const LAT_RE = /\blat\s*=\s*["']([^"']+)["']/i;
const LON_RE = /\blon\s*=\s*["']([^"']+)["']/i;
const NAME_RE = new RegExp(
  String.raw`<${NS}name\b[^>]*>([\s\S]*?)<\/${NS}name\s*>`,
  "i",
);
const COMMENT_RE = /<!--[\s\S]*?-->/g;
const CDATA_RE = /<!\[CDATA\[([\s\S]*?)\]\]>/g;
const ENTITY_RE = /&(?:#x([0-9a-fA-F]+)|#([0-9]+)|(lt|gt|quot|apos|amp));/g;

const NAMED_ENTITIES: Record<string, string> = {
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  amp: "&",
};

/** Decodes the five XML entities and numeric references in a single pass. */
function decodeXmlEntities(s: string): string {
  return s.replace(ENTITY_RE, (match, hex, dec, named) => {
    if (named) return NAMED_ENTITIES[named];
    const code = parseInt(hex ?? dec, hex ? 16 : 10);
    return code <= 0x10ffff ? String.fromCodePoint(code) : match;
  });
}

/** Element text: CDATA sections stay literal, the rest is entity-decoded. */
function decodeText(raw: string): string {
  let out = "";
  let last = 0;
  for (const m of raw.matchAll(CDATA_RE)) {
    out += decodeXmlEntities(raw.slice(last, m.index)) + m[1];
    last = m.index + m[0].length;
  }
  return out + decodeXmlEntities(raw.slice(last));
}

/**
 * Parses all valid `<wpt>` waypoints from a GPX document. Entries with
 * missing, non-numeric or out-of-range coordinates are skipped.
 */
export function parseGpxWaypoints(xml: string): GpxWaypoint[] {
  const waypoints: GpxWaypoint[] = [];

  for (const match of xml.replace(COMMENT_RE, "").matchAll(WPT_RE)) {
    const attrs = match[2] ?? "";
    const body = match[3] ?? "";

    const latStr = attrs.match(LAT_RE)?.[1];
    const lonStr = attrs.match(LON_RE)?.[1];
    if (latStr == null || lonStr == null) continue;

    const lat = Number(latStr);
    const lon = Number(lonStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    if (!isUtmLatLon(lat, lon)) continue;

    const nameRaw = body.match(NAME_RE)?.[1];
    const name = nameRaw != null ? decodeText(nameRaw).trim() : "";

    waypoints.push(name ? { lat, lon, name } : { lat, lon });
  }

  return waypoints;
}
