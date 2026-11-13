import { latLonToUTM, utmToLatLon } from "@/lib/geo/utmConversion";
import { haversineMeters } from "@/lib/geo/geo";

describe("latLonToUTM", () => {
  it("puts the equator on a central meridian at 500 000 E / 0 N", () => {
    expect(latLonToUTM(0, 9)).toEqual({
      easting: 500000,
      northing: 0,
      zone: 32,
      hemisphere: "N",
      label: "32N",
    });
  });

  it("gives k0 × meridian arc as northing on the central meridian (45°N: 4 982 950 m)", () => {
    // WGS84 meridian arc to 45° = 4 984 944.38 m; × 0.9996 = 4 982 950.40 m
    const utm = latLonToUTM(45, 9);
    expect(utm.easting).toBe(500000);
    expect(Math.abs(utm.northing - 4_982_950)).toBeLessThanOrEqual(1);
  });

  it.each([
    [51.53, 9.93, 32], // Göttingen
    [52.52, 13.4, 33], // Berlin
    [50.94, 6.96, 32], // Köln
    [48.14, 11.58, 32], // München
  ])("assigns (%p, %p) to zone %p", (lat, lon, zone) => {
    expect(latLonToUTM(lat, lon).zone).toBe(zone);
  });

  it("uses the false northing on the southern hemisphere", () => {
    const utm = latLonToUTM(-33.9, 18.4);
    expect(utm.hemisphere).toBe("S");
    expect(utm.label).toBe("34S");
    expect(utm.northing).toBeGreaterThan(6_000_000);
    expect(utm.northing).toBeLessThan(10_000_000);
  });
});

describe("utmToLatLon ∘ latLonToUTM", () => {
  // Eastings/northings are rounded to whole metres, so the round trip may be
  // off by up to ~0.7 m — far below GPS accuracy in the field.
  it.each([
    [51.53, 9.93],
    [52.52, 13.4],
    [47.42, 10.98],
    [54.32, 10.13],
    [-33.9, 18.4],
  ])("round-trips (%p, %p) to within 1 m", (lat, lon) => {
    const utm = latLonToUTM(lat, lon);
    const back = utmToLatLon(
      utm.easting,
      utm.northing,
      utm.zone,
      utm.hemisphere,
    );
    expect(haversineMeters(lat, lon, back.lat, back.lon)).toBeLessThan(1);
  });
});

describe("latLonToUTM zone range", () => {
  it.each([
    [-180, 1],
    [-174.0001, 1],
    [-174, 2],
    [179.9999, 60],
    [180, 60], // antimeridian: eastern edge of zone 60, never zone 61
  ])("lon %p → zone %p", (lon, zone) => {
    const utm = latLonToUTM(10, lon);
    expect(utm.zone).toBe(zone);
    expect(utm.label).toBe(`${zone}N`);
  });

  it("round-trips lon = 180 through zone 60", () => {
    const utm = latLonToUTM(-20, 180);
    const back = utmToLatLon(
      utm.easting,
      utm.northing,
      utm.zone,
      utm.hemisphere,
    );
    expect(back.lat).toBeCloseTo(-20, 4);
    expect(back.lon).toBeCloseTo(180, 4);
  });
});
