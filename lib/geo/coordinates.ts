/**
 * Coordinate helpers shared by the Standort form, the Aufnahme screen and the
 * Kampagne proximity view: parsing UTM zone labels, converting user-entered
 * coordinate strings (decimal comma allowed) and resolving a stored Aufnahme's
 * WGS84 position.
 */
import { parseDecimal } from "@/lib/number";
import { latLonToUTM, utmToLatLon } from "@/lib/geo/utmConversion";

/** Latitude range in which UTM is defined. */
const UTM_LAT_MIN = -80;
const UTM_LAT_MAX = 84;

/** Parses a UTM zone label like "32N" / "32 n" into zone number (1–60) and hemisphere. */
export function parseZone(
  s: string,
): { number: number; hemisphere: "N" | "S" } | null {
  const m = s
    .trim()
    .toUpperCase()
    .match(/^(\d{1,2})\s*([NS])$/);
  if (!m) return null;
  const zone = parseInt(m[1], 10);
  if (zone < 1 || zone > 60) return null;
  return { number: zone, hemisphere: m[2] as "N" | "S" };
}

/** True when lat/lon lie in the range UTM can represent (−80…84°, −180…180°). */
export function isUtmLatLon(lat: number, lon: number): boolean {
  return lat >= UTM_LAT_MIN && lat <= UTM_LAT_MAX && lon >= -180 && lon <= 180;
}

/** Converts UTM strings to decimal-degree strings (6 decimals), or null if invalid. */
export function utmStringsToDegrees(
  easting: string,
  northing: string,
  zone: string,
): { lat: string; lon: string } | null {
  const e = parseDecimal(easting);
  const n = parseDecimal(northing);
  const z = parseZone(zone);
  if (e === null || n === null || !z) return null;
  const { lat, lon } = utmToLatLon(e, n, z.number, z.hemisphere);
  if (!isUtmLatLon(lat, lon)) return null;
  return { lat: lat.toFixed(6), lon: lon.toFixed(6) };
}

/** Converts decimal-degree strings to UTM strings, or null if invalid / out of range. */
export function degreeStringsToUtm(
  lat: string,
  lon: string,
): { easting: string; northing: string; zone: string } | null {
  const la = parseDecimal(lat);
  const lo = parseDecimal(lon);
  if (la === null || lo === null || !isUtmLatLon(la, lo)) return null;
  const utm = latLonToUTM(la, lo);
  return {
    easting: String(utm.easting),
    northing: String(utm.northing),
    zone: utm.label,
  };
}

type StoredCoords = {
  gps_lat: number | null;
  gps_lon: number | null;
  utm_easting: number | null;
  utm_northing: number | null;
  utm_zone: string | null;
};

/**
 * Resolves a stored Aufnahme's WGS84 position: GPS when present, otherwise
 * derived from the stored UTM coordinates. Null when neither is usable.
 */
export function storedLatLon(
  a: StoredCoords,
): { lat: number; lon: number } | null {
  if (a.gps_lat != null && a.gps_lon != null) {
    return { lat: a.gps_lat, lon: a.gps_lon };
  }
  if (a.utm_easting != null && a.utm_northing != null && a.utm_zone) {
    const z = parseZone(a.utm_zone);
    if (z) {
      const ll = utmToLatLon(
        a.utm_easting,
        a.utm_northing,
        z.number,
        z.hemisphere,
      );
      if (isUtmLatLon(ll.lat, ll.lon)) return ll;
    }
  }
  return null;
}
