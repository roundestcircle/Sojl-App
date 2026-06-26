// Spherical-earth geo helpers for the proximity detector and "Ort finden" compass.
// Accurate to well within a metre over the short distances relevant here.

const EARTH_RADIUS_M = 6_371_000;

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

/** Great-circle distance between two WGS84 points, in metres (Haversine). */
export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

/**
 * Initial bearing from point 1 to point 2, in degrees clockwise from true north
 * (0–360).
 */
export function bearingDegrees(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const dλ = toRad(lon2 - lon1);
  const y = Math.sin(dλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Normalises any angle into the [0, 360) range. */
export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Exponentially smooths a heading toward `next`, always taking the shortest path
 * around the 0/360 wrap. `factor` ∈ (0, 1]: higher follows the raw value more
 * closely (less smoothing), lower is steadier (more smoothing). A null `prev`
 * (first reading) is returned as-is. Result is normalised to [0, 360).
 */
export function smoothHeading(
  prev: number | null,
  next: number,
  factor: number,
): number {
  if (prev == null) return normalizeAngle(next);
  // Shortest signed delta in (−180, 180].
  const delta = ((next - prev + 540) % 360) - 180;
  return normalizeAngle(prev + delta * factor);
}
