import type { Aufnahme, AufnahmeDetails } from "@/lib/db/aufnahmeQueries";
import {
  AUFNAHME_DETAIL_COLUMNS,
  AUFNAHME_REAL_COLUMNS,
  type AufnahmeDetailColumn,
} from "@/lib/db/columns";
import {
  degreeStringsToUtm,
  isUtmLatLon,
  parseZone,
  utmStringsToDegrees,
} from "@/lib/geo/coordinates";
import { latLonToUTM, utmToLatLon } from "@/lib/geo/utmConversion";
import { parseDecimal } from "@/lib/number";

/** DB coordinate columns; the form edits them through the string fields below. */
type CoordColumn =
  "gps_lat" | "gps_lon" | "utm_easting" | "utm_northing" | "utm_zone";

/** Every non-coordinate detail column as a string field, plus both coordinate formats. */
export type AufnahmeFormData = Record<
  Exclude<AufnahmeDetailColumn, CoordColumn>,
  string
> & {
  easting: string;
  northing: string;
  zone: string;
  lat: string;
  lon: string;
};

/** Which coordinate input is shown in the form. */
export type CoordMode = "utm" | "degrees";

/**
 * Where the saved coordinates come from: the values stored in the DB
 * (untouched since loading — never re-derived, so they keep full precision),
 * or whichever field set the user edited last.
 */
export type CoordSource = "stored" | CoordMode;

export const UTM_FIELDS = ["easting", "northing", "zone"] as const;
export const DEGREE_FIELDS = ["lat", "lon"] as const;

const COORD_COLUMNS: ReadonlySet<string> = new Set<CoordColumn>([
  "gps_lat",
  "gps_lon",
  "utm_easting",
  "utm_northing",
  "utm_zone",
]);

const FIELD_COLUMNS = AUFNAHME_DETAIL_COLUMNS.filter(
  (c): c is Exclude<AufnahmeDetailColumn, CoordColumn> => !COORD_COLUMNS.has(c),
);

type StoredCoords = Pick<Aufnahme, CoordColumn>;

// ─── DB row ⇄ form values ─────────────────────────────────────────────────────

/**
 * Builds form defaults from the stored Aufnahme. Coordinates are filled in
 * both formats: whichever one is stored is converted into the other.
 */
export function toAufnahmeFormDefaults(a: Aufnahme): AufnahmeFormData {
  let utm =
    a.utm_easting != null && a.utm_northing != null && a.utm_zone
      ? {
          easting: String(a.utm_easting),
          northing: String(a.utm_northing),
          zone: a.utm_zone,
        }
      : null;
  let deg =
    a.gps_lat != null && a.gps_lon != null
      ? { lat: a.gps_lat.toFixed(6), lon: a.gps_lon.toFixed(6) }
      : null;
  if (!utm && deg) utm = degreeStringsToUtm(deg.lat, deg.lon);
  if (!deg && utm)
    deg = utmStringsToDegrees(utm.easting, utm.northing, utm.zone);

  const values = {
    easting: utm?.easting ?? "",
    northing: utm?.northing ?? "",
    zone: utm?.zone ?? "",
    lat: deg?.lat ?? "",
    lon: deg?.lon ?? "",
  } as AufnahmeFormData;
  for (const c of FIELD_COLUMNS) {
    const v = a[c];
    values[c] = v == null ? "" : String(v);
  }
  return values;
}

/** Coordinates from the form's UTM or degree fields, converted into the other format. */
function coordsFrom(
  data: Partial<AufnahmeFormData>,
  source: CoordMode,
): StoredCoords {
  const none: StoredCoords = {
    gps_lat: null,
    gps_lon: null,
    utm_easting: null,
    utm_northing: null,
    utm_zone: null,
  };
  if (source === "utm") {
    const e = parseDecimal(data.easting);
    const n = parseDecimal(data.northing);
    const z = parseZone(data.zone ?? "");
    if (e === null || n === null || !z) return none;
    const { lat, lon } = utmToLatLon(e, n, z.number, z.hemisphere);
    const valid = isUtmLatLon(lat, lon);
    return {
      gps_lat: valid ? lat : null,
      gps_lon: valid ? lon : null,
      utm_easting: e,
      utm_northing: n,
      utm_zone: `${z.number}${z.hemisphere}`,
    };
  }
  const lat = parseDecimal(data.lat);
  const lon = parseDecimal(data.lon);
  if (lat === null || lon === null || !isUtmLatLon(lat, lon)) return none;
  const utm = latLonToUTM(lat, lon);
  return {
    gps_lat: lat,
    gps_lon: lon,
    utm_easting: utm.easting,
    utm_northing: utm.northing,
    utm_zone: utm.label,
  };
}

/**
 * Converts (partial) form values into the DB update payload. Coordinates are
 * kept as stored until the user edits them; then they are taken from the edited
 * format and converted into the other one.
 */
export function toAufnahmeDetails(
  data: Partial<AufnahmeFormData>,
  source: CoordSource,
  stored: StoredCoords,
): AufnahmeDetails {
  const coords: StoredCoords =
    source === "stored"
      ? {
          gps_lat: stored.gps_lat,
          gps_lon: stored.gps_lon,
          utm_easting: stored.utm_easting,
          utm_northing: stored.utm_northing,
          utm_zone: stored.utm_zone,
        }
      : coordsFrom(data, source);
  const details = { ...coords } as AufnahmeDetails;
  for (const c of FIELD_COLUMNS) {
    const v = data[c];
    if (AUFNAHME_REAL_COLUMNS.has(c)) {
      (details as Record<string, unknown>)[c] = parseDecimal(v);
    } else {
      (details as Record<string, unknown>)[c] = v || null;
    }
  }
  return details;
}
