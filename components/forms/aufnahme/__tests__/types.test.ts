import {
  toAufnahmeFormDefaults,
  toAufnahmeDetails,
} from "@/components/forms/aufnahme/types";
import type { Aufnahme } from "@/lib/db/aufnahmeQueries";

// Coordinate parsing/conversion helpers are tested in lib/geo/__tests__/coordinates.test.ts.

const emptyAufnahme = (fields: Partial<Aufnahme> = {}): Aufnahme =>
  ({
    gps_lat: null,
    gps_lon: null,
    utm_easting: null,
    utm_northing: null,
    utm_zone: null,
    ...fields,
  }) as Aufnahme;

const noCoords = emptyAufnahme();

describe("toAufnahmeFormDefaults", () => {
  it("derives UTM fields when only GPS is stored", () => {
    const v = toAufnahmeFormDefaults(
      emptyAufnahme({ gps_lat: 51.533, gps_lon: 9.935 }),
    );
    expect(v.lat).toBe("51.533000");
    expect(v.zone).toBe("32N");
    expect(v.easting).not.toBe("");
  });

  it("derives degree fields when only UTM is stored", () => {
    const v = toAufnahmeFormDefaults(
      emptyAufnahme({ utm_easting: 500000, utm_northing: 0, utm_zone: "32N" }),
    );
    expect(parseFloat(v.lat)).toBeCloseTo(0, 6);
    expect(parseFloat(v.lon)).toBeCloseTo(9, 6);
  });

  it("maps null columns to empty strings and numbers to strings", () => {
    const v = toAufnahmeFormDefaults(
      emptyAufnahme({ m_ue_nn: 350, notizen: null }),
    );
    expect(v.m_ue_nn).toBe("350");
    expect(v.notizen).toBe("");
    expect(v.easting).toBe("");
  });
});

describe("toAufnahmeDetails", () => {
  it("keeps the stored coordinates unchanged until a coordinate is edited", () => {
    const stored = emptyAufnahme({
      gps_lat: 51.5123456,
      gps_lon: 9.9345678,
      utm_easting: 1,
      utm_northing: 2,
      utm_zone: "32N",
    });
    // Form strings are rounded (6 decimals / whole metres) — must not be re-derived.
    const d = toAufnahmeDetails(
      { lat: "51.512346", easting: "999" },
      "stored",
      stored,
    );
    expect(d).toMatchObject({
      gps_lat: 51.5123456,
      gps_lon: 9.9345678,
      utm_easting: 1,
      utm_northing: 2,
      utm_zone: "32N",
    });
  });

  it("takes coordinates from the UTM fields after a UTM edit", () => {
    const d = toAufnahmeDetails(
      { easting: "500000", northing: "0", zone: "32n", lat: "1", lon: "1" },
      "utm",
      noCoords,
    );
    expect(d.utm_zone).toBe("32N");
    expect(d.gps_lat).toBeCloseTo(0, 6);
    expect(d.gps_lon).toBeCloseTo(9, 6);
  });

  it("takes coordinates from the degree fields after a degree edit", () => {
    const d = toAufnahmeDetails(
      { lat: "0", lon: "9", easting: "1" },
      "degrees",
      noCoords,
    );
    expect(d).toMatchObject({
      gps_lat: 0,
      gps_lon: 9,
      utm_easting: 500000,
      utm_northing: 0,
      utm_zone: "32N",
    });
  });

  it("accepts decimal commas and rejects out-of-range degrees", () => {
    const comma = toAufnahmeDetails(
      { lat: "51,5074", lon: "9,3456" },
      "degrees",
      noCoords,
    );
    expect(comma.gps_lat).toBeCloseTo(51.5074, 6);
    expect(comma.gps_lon).toBeCloseTo(9.3456, 6);
    const bad = toAufnahmeDetails({ lat: "95", lon: "9" }, "degrees", noCoords);
    expect(bad.gps_lat).toBeNull();
    expect(bad.utm_zone).toBeNull();
  });

  it("stores empty text as null and parses numbers (decimal comma too)", () => {
    const d = toAufnahmeDetails(
      {
        notizen: "",
        bodentyp: "Braunerde",
        mittl_temp: "9,5",
        m_ue_nn: "",
        mittl_n: "ca. 700",
      },
      "stored",
      noCoords,
    );
    expect(d.notizen).toBeNull();
    expect(d.bodentyp).toBe("Braunerde");
    expect(d.mittl_temp).toBe(9.5);
    expect(d.m_ue_nn).toBeNull();
    expect(d.mittl_n).toBeNull();
    expect(d.gps_lat).toBeNull();
  });
});
