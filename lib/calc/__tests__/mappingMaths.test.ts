import {
  calcMaechtigkeitDm,
  calcGrundigkeitCm,
  calcProfileFKOrNFK,
  calcProfileSWert,
  rateGPV,
  rateKAK,
  rateNFK,
  rateSWert,
} from "@/lib/calc/mappingMaths";
import type { Horizont } from "@/lib/db/horizontQueries";

/** Minimal Horizont stub; only the fields used by the profile sums matter. */
const h = (fields: Partial<Horizont>): Horizont => fields as Horizont;

describe("calcMaechtigkeitDm", () => {
  it("converts the depth span from cm to dm with one decimal", () => {
    expect(calcMaechtigkeitDm("0", "30")).toBe("3.0");
    expect(calcMaechtigkeitDm("30", "45")).toBe("1.5");
  });

  it("accepts a decimal comma", () => {
    expect(calcMaechtigkeitDm("12,5", "40")).toBe("2.8");
    expect(calcMaechtigkeitDm("0", "32,5")).toBe("3.3");
  });

  it("is empty for missing, non-numeric or inverted depths", () => {
    expect(calcMaechtigkeitDm("", "30")).toBe("");
    expect(calcMaechtigkeitDm("a", "30")).toBe("");
    expect(calcMaechtigkeitDm("30", "30")).toBe("");
    expect(calcMaechtigkeitDm("40", "30")).toBe("");
  });
});

describe("calcGrundigkeitCm", () => {
  it("is the deepest lower boundary in cm", () => {
    expect(calcGrundigkeitCm(["30", "45", "85"])).toBe("85");
  });

  it("is not fooled by gaps or overlaps between horizons", () => {
    // 0–30, (missing), 60–90 → 90; overlapping 0–30 / 20–50 → 50
    expect(calcGrundigkeitCm(["30", null, "90"])).toBe("90");
    expect(calcGrundigkeitCm(["30", "50"])).toBe("50");
  });

  it("skips invalid entries and is empty when nothing is valid", () => {
    expect(calcGrundigkeitCm(["30", "", "x"])).toBe("30");
    expect(calcGrundigkeitCm([])).toBe("");
  });
});

describe("calcProfileFKOrNFK", () => {
  const profile = [
    h({ tiefe_oben: "0", tiefe_unten: "30", fk_lm2: "100", nfk_lm2: "60" }),
    h({ tiefe_oben: "30", tiefe_unten: "80", fk_lm2: "150", nfk_lm2: "90" }),
    h({ tiefe_oben: "80", tiefe_unten: "120", fk_lm2: "80", nfk_lm2: "40" }),
  ];

  it("sums horizons fully above the limit and clips the straddling one", () => {
    // 100 + 150 + 80 × (100−80)/(120−80) = 290
    expect(calcProfileFKOrNFK(profile, 100, "fk_lm2")).toBeCloseTo(290, 6);
  });

  it("ignores horizons starting at or below the limit", () => {
    expect(calcProfileFKOrNFK(profile, 30, "nfk_lm2")).toBeCloseTo(60, 6);
  });

  it("returns null without a valid limit or contributing horizon", () => {
    expect(calcProfileFKOrNFK(profile, NaN, "fk_lm2")).toBeNull();
    expect(calcProfileFKOrNFK(profile, 0, "fk_lm2")).toBeNull();
    expect(calcProfileFKOrNFK([], 100, "fk_lm2")).toBeNull();
  });

  it("allows a profile that ends above the limit (e.g. on bedrock)", () => {
    expect(calcProfileFKOrNFK(profile.slice(0, 2), 100, "fk_lm2")).toBeCloseTo(
      250,
      6,
    );
  });

  it("is 'unvollständig' for missing values, gaps, overlaps or bad depths", () => {
    const missingValue = [profile[0], { ...profile[1], fk_lm2: null }];
    const gap = [profile[0], profile[2]];
    const overlap = [
      profile[0],
      h({ tiefe_oben: "20", tiefe_unten: "60", fk_lm2: "100" }),
    ];
    const notFromZero = [profile[1]];
    const noDepth = [h({ tiefe_oben: "0", fk_lm2: "10" })];
    for (const p of [missingValue, gap, overlap, notFromZero, noDepth]) {
      expect(calcProfileFKOrNFK(p, 100, "fk_lm2")).toBe("unvollständig");
    }
  });

  it("is independent of the horizon order and accepts decimal commas", () => {
    const reversed = [...profile].reverse();
    expect(calcProfileFKOrNFK(reversed, 100, "fk_lm2")).toBeCloseTo(290, 6);
    const comma = [h({ tiefe_oben: "0", tiefe_unten: "30", fk_lm2: "100,5" })];
    expect(calcProfileFKOrNFK(comma, 100, "fk_lm2")).toBeCloseTo(100.5, 6);
  });
});

describe("calcProfileSWert", () => {
  const base = { kak: "20", basensaettigung: "50", trockenrohdichte: "1,5" };

  it("weights A-horizons fully and all others by 0.5", () => {
    const profile = [
      h({ ...base, horizontname: "Ap", tiefe_oben: "0", tiefe_unten: "20" }),
      h({ ...base, horizontname: "Bv", tiefe_oben: "20", tiefe_unten: "40" }),
    ];
    // per horizon: 20 cmol_c/kg × 0.5 × 1.5 kg/dm³ × 2 dm = 30 cmol_c/dm²
    // = 3000 cmol_c/m² → Ap 3000 + Bv 1500
    expect(calcProfileSWert(profile, 100)).toBeCloseTo(4500, 6);
  });

  it("returns cmol_c/m² (1 kg/dm³ × 1 dm × 1 cmol_c/kg = 100 cmol_c/m²)", () => {
    const profile = [
      h({
        horizontname: "Ah",
        tiefe_oben: "0",
        tiefe_unten: "10",
        kak: "1",
        basensaettigung: "100",
        trockenrohdichte: "1",
      }),
    ];
    expect(calcProfileSWert(profile, 100)).toBeCloseTo(100, 6);
  });

  it("recognises prefixed A-horizons (fAh) and clips at the limit", () => {
    const profile = [
      h({ ...base, horizontname: "fAh", tiefe_oben: "0", tiefe_unten: "40" }),
    ];
    // clipped to 0–20 cm = 2 dm → 3000
    expect(calcProfileSWert(profile, 20)).toBeCloseTo(3000, 6);
  });

  it("is 'unvollständig' when a horizon lacks KAK, BS or TRD", () => {
    const profile = [
      h({ horizontname: "Ah", tiefe_oben: "0", tiefe_unten: "20", kak: "20" }),
    ];
    expect(calcProfileSWert(profile, 100)).toBe("unvollständig");
  });
});

describe("rating thresholds", () => {
  it("uses lower-inclusive class boundaries", () => {
    expect(rateGPV(34.9)).toBe("sehr gering");
    expect(rateGPV(35)).toBe("gering");
    expect(rateGPV(56)).toBe("sehr hoch");
    expect(rateNFK(49.9)).toBe("sehr gering");
    expect(rateNFK(50)).toBe("gering");
  });

  it("rates the S-Wert in cmol_c/m² (1/10/50/200 mol_c/m² boundaries)", () => {
    expect(rateSWert(99)).toBe("sehr gering");
    expect(rateSWert(100)).toBe("gering");
    expect(rateSWert(1000)).toBe("mittel");
    expect(rateSWert(5000)).toBe("hoch");
    expect(rateSWert(20000)).toBe("sehr hoch");
  });

  it("rateKAK covers every bucket from 'sehr gering' to 'sehr hoch'", () => {
    const labels = new Set(
      [0, 2, 4, 6, 8, 10, 15, 20, 30, 40, 60, 100].map(rateKAK),
    );
    expect(labels).toContain("sehr gering");
    expect(labels).toContain("sehr hoch");
  });
});
