import { latLonToUTM, utmToLatLon } from "@/lib/geo/utmConversion";
import type { Aufnahme, AufnahmeDetails } from "@/lib/db/aufnahmeQueries";

export type AufnahmeFormData = {
  easting: string;
  northing: string;
  zone: string;
  lat: string;
  lon: string;
  notizen: string;
  bodentyp: string;
  bodtyp_abk: string;
  humusform: string;
  humsfrm_abk: string;
  m_ue_nn: string;
  witterung: string;
  mittl_n: string;
  mittl_temp: string;
  nutzung: string;
  vegetation: string;
  reliefpos: string;
  expos: string;
  ausgangsgestein: string;
  grundigkeit: string;
  effektiver_wurzelraum: string;
  hangneigung: string;
  reliefformtyp: string;
  mikrorelief: string;
  nat_bodenabtrag: string;
  kuenstl_bodenabtrag: string;
  anthropogene_veraend: string;
  bodenoberflaeche: string;
  versiegelungsart: string;
  regenwuermer: string;
  substratsyst_einheit: string;
  hydrogeniet_moortyp: string;
  durchwurzelbarer_bodenraum: string;
  wasserstand_gof: string;
  grundnaessestufe: string;
  besond_wasserverh: string;
  stau_haftnaessestufe: string;
  erosionsgrad: string;
};

/** Which coordinate input is shown (and therefore authoritative when saving). */
export type CoordMode = "utm" | "degrees";

/** Text columns stored 1:1 (empty string ⇄ null). */
const TEXT_FIELDS = [
  "notizen",
  "bodentyp",
  "bodtyp_abk",
  "humusform",
  "humsfrm_abk",
  "witterung",
  "nutzung",
  "vegetation",
  "reliefpos",
  "expos",
  "ausgangsgestein",
  "hangneigung",
  "reliefformtyp",
  "mikrorelief",
  "nat_bodenabtrag",
  "kuenstl_bodenabtrag",
  "anthropogene_veraend",
  "bodenoberflaeche",
  "versiegelungsart",
  "regenwuermer",
  "substratsyst_einheit",
  "hydrogeniet_moortyp",
  "durchwurzelbarer_bodenraum",
  "wasserstand_gof",
  "grundnaessestufe",
  "besond_wasserverh",
  "stau_haftnaessestufe",
  "erosionsgrad",
] as const satisfies readonly (keyof AufnahmeFormData &
  keyof AufnahmeDetails)[];

/** Numeric columns (string in the form, number | null in the DB). */
const NUMBER_FIELDS = [
  "m_ue_nn",
  "mittl_n",
  "mittl_temp",
  "grundigkeit",
  "effektiver_wurzelraum",
] as const satisfies readonly (keyof AufnahmeFormData &
  keyof AufnahmeDetails)[];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parses a UTM zone string like "32N" into its numeric zone and hemisphere components. */
export function parseZone(
  s: string,
): { number: number; hemisphere: "N" | "S" } | null {
  const m = s
    .trim()
    .toUpperCase()
    .match(/^(\d+)([NS])$/);
  if (!m) return null;
  return { number: parseInt(m[1], 10), hemisphere: m[2] as "N" | "S" };
}

/** Parses a string to a float, returning null if the result is NaN. */
export const parseNum = (s: string | undefined): number | null => {
  const n = parseFloat(s ?? "");
  return isNaN(n) ? null : n;
};

/** Converts UTM strings to decimal-degree strings (6 decimals), or null if invalid. */
export function utmStringsToDegrees(
  easting: string,
  northing: string,
  zone: string,
): { lat: string; lon: string } | null {
  const e = parseFloat(easting);
  const n = parseFloat(northing);
  const z = parseZone(zone);
  if (isNaN(e) || isNaN(n) || !z) return null;
  try {
    const { lat, lon } = utmToLatLon(e, n, z.number, z.hemisphere);
    return { lat: lat.toFixed(6), lon: lon.toFixed(6) };
  } catch {
    return null;
  }
}

/** Converts decimal-degree strings to UTM strings, or null if invalid. */
export function degreeStringsToUtm(
  lat: string,
  lon: string,
): { easting: string; northing: string; zone: string } | null {
  const la = parseFloat(lat);
  const lo = parseFloat(lon);
  if (isNaN(la) || isNaN(lo)) return null;
  const utm = latLonToUTM(la, lo);
  return {
    easting: String(utm.easting),
    northing: String(utm.northing),
    zone: utm.label,
  };
}

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
  for (const f of TEXT_FIELDS) values[f] = a[f] ?? "";
  for (const f of NUMBER_FIELDS) values[f] = a[f] != null ? String(a[f]) : "";
  return values;
}

/**
 * Converts (partial) form values into the DB update payload. Coordinates are
 * taken from the input mode currently shown and converted into the other format.
 */
export function toAufnahmeDetails(
  data: Partial<AufnahmeFormData>,
  mode: CoordMode,
): AufnahmeDetails {
  let gps_lat: number | null = null;
  let gps_lon: number | null = null;
  let utm_easting: number | null = null;
  let utm_northing: number | null = null;
  let utm_zone: string | null = null;

  if (mode === "utm") {
    const e = parseFloat(data.easting ?? "");
    const n = parseFloat(data.northing ?? "");
    const z = parseZone(data.zone ?? "");
    if (!isNaN(e) && !isNaN(n) && z) {
      utm_easting = e;
      utm_northing = n;
      utm_zone = (data.zone ?? "").trim().toUpperCase();
      try {
        const res = utmToLatLon(e, n, z.number, z.hemisphere);
        gps_lat = res.lat;
        gps_lon = res.lon;
      } catch {}
    }
  } else {
    const lat = parseFloat(data.lat ?? "");
    const lon = parseFloat(data.lon ?? "");
    if (!isNaN(lat) && !isNaN(lon)) {
      gps_lat = lat;
      gps_lon = lon;
      const utm = latLonToUTM(lat, lon);
      utm_easting = utm.easting;
      utm_northing = utm.northing;
      utm_zone = utm.label;
    }
  }

  const details = {
    gps_lat,
    gps_lon,
    utm_easting,
    utm_northing,
    utm_zone,
  } as AufnahmeDetails;
  for (const f of TEXT_FIELDS) details[f] = data[f] || null;
  for (const f of NUMBER_FIELDS) details[f] = parseNum(data[f]);
  return details;
}
