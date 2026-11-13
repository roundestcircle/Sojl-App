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
 * Signed shortest rotation from `from` to `to`, in degrees within (−180, 180].
 * Works for any (also negative or unbounded) inputs, e.g. for an unwrapped
 * arrow rotation: angleDelta(360, −350) = +10.
 */
export function angleDelta(from: number, to: number): number {
  const d = normalizeAngle(to - from);
  return d > 180 ? d - 360 : d;
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
  return normalizeAngle(prev + angleDelta(prev, next) * factor);
}

/** Smallest radius at which a stored point counts as "reached", in metres. */
export const PROXIMITY_MIN_RADIUS_M = 5;
/** Extra margin before a reached point is released again (hysteresis), in metres. */
export const PROXIMITY_HYSTERESIS_M = 3;

/**
 * Proximity test with hysteresis, so a highlight does not flicker while the
 * GPS fix jitters around the radius. A point is entered within
 * max(5 m, accuracy) and only left beyond that radius + 3 m. `wasNear` is the
 * previous result for the same point.
 */
export function isWithinProximity(
  distance: number,
  accuracy: number | null | undefined,
  wasNear: boolean,
): boolean {
  const enter = Math.max(
    PROXIMITY_MIN_RADIUS_M,
    accuracy ?? PROXIMITY_MIN_RADIUS_M,
  );
  return distance <= (wasNear ? enter + PROXIMITY_HYSTERESIS_M : enter);
}
