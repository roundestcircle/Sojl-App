import {
  haversineMeters,
  bearingDegrees,
  normalizeAngle,
  smoothHeading,
  angleDelta,
  isWithinProximity,
} from "@/lib/geo/geo";

describe("haversineMeters", () => {
  it("is zero for identical points", () => {
    expect(haversineMeters(51.5, 9.9, 51.5, 9.9)).toBe(0);
  });

  it("matches one degree of latitude on the 6371 km sphere (~111.195 km)", () => {
    expect(haversineMeters(50, 10, 51, 10)).toBeCloseTo(111_194.9, 0);
  });

  it("is symmetric", () => {
    const a = haversineMeters(51.53, 9.93, 51.54, 9.95);
    const b = haversineMeters(51.54, 9.95, 51.53, 9.93);
    expect(a).toBeCloseTo(b, 6);
  });

  it("resolves the 5 m proximity radius (≈ 0.000045° of latitude)", () => {
    const d = haversineMeters(51.5, 9.9, 51.500045, 9.9);
    expect(d).toBeGreaterThan(4.9);
    expect(d).toBeLessThan(5.1);
  });
});

describe("bearingDegrees", () => {
  it.each([
    ["north", 51, 10, 52, 10, 0],
    ["south", 51, 10, 50, 10, 180],
    ["east (on the equator)", 0, 10, 0, 11, 90],
    ["west (on the equator)", 0, 10, 0, 9, 270],
  ])("points %s", (_label, lat1, lon1, lat2, lon2, expected) => {
    expect(bearingDegrees(lat1, lon1, lat2, lon2)).toBeCloseTo(expected, 6);
  });

  it("always returns a value in [0, 360)", () => {
    const b = bearingDegrees(51, 10, 50.9, 9.9);
    expect(b).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(360);
  });
});

describe("normalizeAngle", () => {
  it.each([
    [0, 0],
    [360, 0],
    [-90, 270],
    [725, 5],
  ])("%p → %p", (input, expected) => {
    expect(normalizeAngle(input)).toBe(expected);
  });
});

describe("smoothHeading", () => {
  it("returns the first reading unchanged (normalised)", () => {
    expect(smoothHeading(null, 370, 0.5)).toBe(10);
  });

  it("takes the short way across north instead of swinging through south", () => {
    // 350° → 10° is a +20° step; half of it lands on 0°, not on 180°.
    expect(smoothHeading(350, 10, 0.5)).toBeCloseTo(0, 6);
  });

  it("follows the raw value completely with factor 1", () => {
    expect(smoothHeading(100, 140, 1)).toBeCloseTo(140, 6);
  });
});

describe("angleDelta", () => {
  it.each([
    [0, 10, 10],
    [10, 0, -10],
    [350, 10, 20],
    [10, 350, -20],
    [0, 180, 180],
    [180, 0, 180],
    [0, 181, -179],
    // Unbounded / negative inputs (unwrapped arrow rotation).
    [360, -350, 10],
    [-350, 360, -10],
    [720, 5, 5],
    [-1000, -1000, 0],
    [-170, 170, -20],
  ])("from %p to %p → %p", (from, to, expected) => {
    expect(angleDelta(from, to)).toBeCloseTo(expected, 9);
  });

  it("always lies in (−180, 180]", () => {
    for (let from = -1080; from <= 1080; from += 37) {
      for (let to = -1080; to <= 1080; to += 41) {
        const d = angleDelta(from, to);
        expect(d).toBeGreaterThan(-180);
        expect(d).toBeLessThanOrEqual(180);
        expect(normalizeAngle(from + d)).toBeCloseTo(normalizeAngle(to), 9);
      }
    }
  });
});

describe("isWithinProximity", () => {
  it("enters within 5 m when the fix is accurate or has no accuracy", () => {
    expect(isWithinProximity(4.9, 2, false)).toBe(true);
    expect(isWithinProximity(5.1, 2, false)).toBe(false);
    expect(isWithinProximity(5, null, false)).toBe(true);
    expect(isWithinProximity(5.1, undefined, false)).toBe(false);
  });

  it("widens the enter radius to the GPS accuracy", () => {
    expect(isWithinProximity(11, 12, false)).toBe(true);
    expect(isWithinProximity(13, 12, false)).toBe(false);
  });

  it("only releases a reached point 3 m beyond the enter radius", () => {
    expect(isWithinProximity(7.9, 2, true)).toBe(true);
    expect(isWithinProximity(8.1, 2, true)).toBe(false);
    expect(isWithinProximity(14.9, 12, true)).toBe(true);
    expect(isWithinProximity(15.1, 12, true)).toBe(false);
  });
});
