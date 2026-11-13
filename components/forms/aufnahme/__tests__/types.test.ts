import {
  parseZone,
  parseNum,
  utmStringsToDegrees,
  degreeStringsToUtm,
  toAufnahmeFormDefaults,
  toAufnahmeDetails,
} from "@/components/forms/aufnahme/types";
import type { Aufnahme } from "@/lib/db/aufnahmeQueries";

const emptyAufnahme = (fields: Partial<Aufnahme> = {}): Aufnahme =>
  ({
    gps_lat: null,
    gps_lon: null,
    utm_easting: null,
    utm_northing: null,
    utm_zone: null,
    ...fields,
  }) as Aufnahme;

describe("parseZone", () => {
  it("parses number and hemisphere case-insensitively", () => {
    expect(parseZone(" 32n ")).toEqual({ number: 32, hemisphere: "N" });
    expect(parseZone("33S")).toEqual({ number: 33, hemisphere: "S" });
  });

  it("rejects labels without hemisphere or with a latitude band", () => {
    expect(parseZone("32")).toBeNull();
    expect(parseZone("32U")).toBeNull();
  });
});

describe("parseNum", () => {
  it("returns null for empty or non-numeric input", () => {
    expect(parseNum("")).toBeNull();
    expect(parseNum(undefined)).toBeNull();
    expect(parseNum("abc")).toBeNull();
    expect(parseNum("12.5")).toBe(12.5);
  });
});

describe("coordinate string conversion", () => {
  it("round-trips degrees → UTM → degrees", () => {
    const utm = degreeStringsToUtm("51.533000", "9.935000");
    expect(utm?.zone).toBe("32N");
    const deg = utmStringsToDegrees(utm!.easting, utm!.northing, utm!.zone);
    expect(parseFloat(deg!.lat)).toBeCloseTo(51.533, 4);
    expect(parseFloat(deg!.lon)).toBeCloseTo(9.935, 4);
  });

  it("returns null for incomplete input", () => {
    expect(degreeStringsToUtm("51.5", "")).toBeNull();
    expect(utmStringsToDegrees("560000", "5710000", "32")).toBeNull();
  });
});

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
  it("takes coordinates from the UTM fields in UTM mode", () => {
    const d = toAufnahmeDetails(
      { easting: "500000", northing: "0", zone: "32n", lat: "1", lon: "1" },
      "utm",
    );
    expect(d.utm_zone).toBe("32N");
    expect(d.gps_lat).toBeCloseTo(0, 6);
    expect(d.gps_lon).toBeCloseTo(9, 6);
  });

  it("takes coordinates from the degree fields in degree mode", () => {
    const d = toAufnahmeDetails(
      { lat: "0", lon: "9", easting: "1" },
      "degrees",
    );
    expect(d).toMatchObject({
      gps_lat: 0,
      gps_lon: 9,
      utm_easting: 500000,
      utm_northing: 0,
      utm_zone: "32N",
    });
  });

  it("stores empty text as null and parses numbers", () => {
    const d = toAufnahmeDetails(
      { notizen: "", bodentyp: "Braunerde", mittl_temp: "9.5", m_ue_nn: "" },
      "utm",
    );
    expect(d.notizen).toBeNull();
    expect(d.bodentyp).toBe("Braunerde");
    expect(d.mittl_temp).toBe(9.5);
    expect(d.m_ue_nn).toBeNull();
    expect(d.gps_lat).toBeNull();
  });
});
