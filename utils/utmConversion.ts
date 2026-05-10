// WGS84 ellipsoid constants
const a = 6378137;
const f = 1 / 298.257223563;
const b = a * (1 - f);
const e2 = (a * a - b * b) / (a * a);   // first eccentricity squared
const ep2 = (a * a - b * b) / (b * b);  // second eccentricity squared
const k0 = 0.9996;                       // UTM scale factor

export type UTMCoord = {
  easting: number;
  northing: number;
  zone: number;
  hemisphere: "N" | "S";
  label: string; // e.g. "32N"
};

/** Converts WGS84 decimal degrees to UTM (WGS84). */
export function latLonToUTM(lat: number, lon: number): UTMCoord {
  const φ = (lat * Math.PI) / 180;
  const λ = (lon * Math.PI) / 180;

  const zone = Math.floor((lon + 180) / 6) + 1;
  const λ0 = (((zone - 1) * 6 - 180 + 3) * Math.PI) / 180;

  const N = a / Math.sqrt(1 - e2 * Math.sin(φ) ** 2);
  const T = Math.tan(φ) ** 2;
  const C = ep2 * Math.cos(φ) ** 2;
  const A = Math.cos(φ) * (λ - λ0);

  const M =
    a *
    ((1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256) * φ -
      ((3 * e2) / 8 + (3 * e2 ** 2) / 32 + (45 * e2 ** 3) / 1024) *
        Math.sin(2 * φ) +
      ((15 * e2 ** 2) / 256 + (45 * e2 ** 3) / 1024) * Math.sin(4 * φ) -
      ((35 * e2 ** 3) / 3072) * Math.sin(6 * φ));

  const easting =
    k0 *
      N *
      (A +
        ((1 - T + C) * A ** 3) / 6 +
        ((5 - 18 * T + T ** 2 + 72 * C - 58 * ep2) * A ** 5) / 120) +
    500000;

  let northing =
    k0 *
    (M +
      N *
        Math.tan(φ) *
        (A ** 2 / 2 +
          ((5 - T + 9 * C + 4 * C ** 2) * A ** 4) / 24 +
          ((61 - 58 * T + T ** 2 + 600 * C - 330 * ep2) * A ** 6) / 720));

  const hemisphere: "N" | "S" = lat >= 0 ? "N" : "S";
  if (lat < 0) northing += 10_000_000;

  return {
    easting: Math.round(easting),
    northing: Math.round(northing),
    zone,
    hemisphere,
    label: `${zone}${hemisphere}`,
  };
}

/** Converts UTM coordinates back to WGS84 decimal degrees. */
export function utmToLatLon(
  easting: number,
  northing: number,
  zone: number,
  hemisphere: "N" | "S",
): { lat: number; lon: number } {
  let N = northing;
  if (hemisphere === "S") N -= 10_000_000;

  const λ0 = (((zone - 1) * 6 - 180 + 3) * Math.PI) / 180;

  const e1 =
    (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));

  const M = N / k0;
  const μ =
    M /
    (a *
      (1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256));

  const φ1 =
    μ +
    ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * μ) +
    ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * μ) +
    ((151 * e1 ** 3) / 96) * Math.sin(6 * μ) +
    ((1097 * e1 ** 4) / 512) * Math.sin(8 * μ);

  const N1 = a / Math.sqrt(1 - e2 * Math.sin(φ1) ** 2);
  const T1 = Math.tan(φ1) ** 2;
  const C1 = ep2 * Math.cos(φ1) ** 2;
  const R1 = (a * (1 - e2)) / (1 - e2 * Math.sin(φ1) ** 2) ** 1.5;
  const D = (easting - 500000) / (N1 * k0);

  const lat =
    φ1 -
    (N1 * Math.tan(φ1)) /
      R1 *
      (D ** 2 / 2 -
        ((5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * ep2) * D ** 4) / 24 +
        ((61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * ep2 - 3 * C1 ** 2) *
          D ** 6) /
          720);

  const lon =
    λ0 +
    (D -
      ((1 + 2 * T1 + C1) * D ** 3) / 6 +
      ((5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * ep2 + 24 * T1 ** 2) *
        D ** 5) /
        120) /
      Math.cos(φ1);

  return {
    lat: (lat * 180) / Math.PI,
    lon: (lon * 180) / Math.PI,
  };
}
