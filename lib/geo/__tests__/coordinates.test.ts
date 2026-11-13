import {
  parseZone,
  isUtmLatLon,
  utmStringsToDegrees,
  degreeStringsToUtm,
  storedLatLon,
} from "@/lib/geo/coordinates";
import { latLonToUTM } from "@/lib/geo/utmConversion";
import { haversineMeters } from "@/lib/geo/geo";

describe("parseZone", () => {
  it.each([
    ["32N", { number: 32, hemisphere: "N" }],
    ["32 n", { number: 32, hemisphere: "N" }],
    [" 33s ", { number: 33, hemisphere: "S" }],
    ["1N", { number: 1, hemisphere: "N" }],
    ["60S", { number: 60, hemisphere: "S" }],
  ])("parses %p", (input, expected) => {
    expect(parseZone(input)).toEqual(expected);
  });

  it.each(["0N", "61N", "99S", "32", "N", "32X", "32U", "", "3 2N", "132N"])(
    "rejects %p",
    (input) => {
      expect(parseZone(input)).toBeNull();
    },
  );
});

describe("isUtmLatLon", () => {
  it.each([
    [51.5, 9.9, true],
    [-80, -180, true],
    [84, 180, true],
    [84.01, 10, false],
    [-80.01, 10, false],
    [50, 180.01, false],
    [50, -180.01, false],
    [NaN, 10, false],
  ])("(%p, %p) → %p", (lat, lon, expected) => {
    expect(isUtmLatLon(lat, lon)).toBe(expected);
  });
});

describe("degreeStringsToUtm", () => {
  it("accepts a German decimal comma", () => {
    expect(degreeStringsToUtm("51,53", "9,93")).toEqual(
      degreeStringsToUtm("51.53", "9.93"),
    );
    expect(degreeStringsToUtm("51,53", "9,93")?.zone).toBe("32N");
  });

  it.each([
    ["85", "10"],
    ["-81", "10"],
    ["50", "181"],
    ["50", "-181"],
    ["", "10"],
    ["nb", "10"],
    ["51.5 N", "10"],
  ])("rejects (%p, %p)", (lat, lon) => {
    expect(degreeStringsToUtm(lat, lon)).toBeNull();
  });
});

describe("utmStringsToDegrees", () => {
  it("converts and round-trips UTM strings (comma allowed)", () => {
    const utm = latLonToUTM(51.53, 9.93);
    const res = utmStringsToDegrees(
      `${utm.easting},0`,
      String(utm.northing),
      "32 n",
    );
    expect(res).not.toBeNull();
    expect(
      haversineMeters(51.53, 9.93, Number(res!.lat), Number(res!.lon)),
    ).toBeLessThan(1);
  });

  it.each([
    ["568000", "5710000", "0N"],
    ["568000", "5710000", "61N"],
    ["568000", "5710000", "32"],
    ["", "5710000", "32N"],
    ["568000", "abc", "32N"],
    // Northing far beyond 84°N
    ["500000", "9900000", "32N"],
  ])("rejects (%p, %p, %p)", (e, n, z) => {
    expect(utmStringsToDegrees(e, n, z)).toBeNull();
  });
});

describe("storedLatLon", () => {
  const empty = {
    gps_lat: null,
    gps_lon: null,
    utm_easting: null,
    utm_northing: null,
    utm_zone: null,
  };

  it("prefers the stored GPS position", () => {
    const utm = latLonToUTM(48, 11);
    expect(
      storedLatLon({
        gps_lat: 51.5,
        gps_lon: 9.9,
        utm_easting: utm.easting,
        utm_northing: utm.northing,
        utm_zone: utm.label,
      }),
    ).toEqual({ lat: 51.5, lon: 9.9 });
  });

  it("falls back to UTM for UTM-only rows (e.g. CSV import)", () => {
    const utm = latLonToUTM(51.53, 9.93);
    const ll = storedLatLon({
      ...empty,
      utm_easting: utm.easting,
      utm_northing: utm.northing,
      utm_zone: "32 n",
    });
    expect(ll).not.toBeNull();
    expect(haversineMeters(51.53, 9.93, ll!.lat, ll!.lon)).toBeLessThan(1);
  });

  it("is null without usable coordinates", () => {
    expect(storedLatLon(empty)).toBeNull();
    expect(storedLatLon({ ...empty, gps_lat: 51.5 })).toBeNull();
    expect(
      storedLatLon({
        ...empty,
        utm_easting: 568000,
        utm_northing: 5710000,
        utm_zone: "99N",
      }),
    ).toBeNull();
    expect(
      storedLatLon({
        ...empty,
        utm_easting: 500000,
        utm_northing: 9_900_000,
        utm_zone: "32N",
      }),
    ).toBeNull();
  });
});
