import {
  calcMaechtigkeitDm,
  calcGrundigkeitCm,
  calcProfileFKOrNFK,
  calcProfileSWert,
  rateGPV,
  rateKAK,
  rateNFK,
} from "@/lib/calc/mappingMaths";
import type { Horizont } from "@/lib/db/horizontQueries";

/** Minimal Horizont stub; only the fields used by the profile sums matter. */
const h = (fields: Partial<Horizont>): Horizont => fields as Horizont;

describe("calcMaechtigkeitDm", () => {
  it("converts the depth span from cm to dm with one decimal", () => {
    expect(calcMaechtigkeitDm("0", "30")).toBe("3.0");
    expect(calcMaechtigkeitDm("30", "45")).toBe("1.5");
  });

  it("is empty for missing, non-numeric or inverted depths", () => {
    expect(calcMaechtigkeitDm("", "30")).toBe("");
    expect(calcMaechtigkeitDm("a", "30")).toBe("");
    expect(calcMaechtigkeitDm("30", "30")).toBe("");
    expect(calcMaechtigkeitDm("40", "30")).toBe("");
  });
});

describe("calcGrundigkeitCm", () => {
  it("sums Mächtigkeiten (dm) and returns cm", () => {
    expect(calcGrundigkeitCm(["3.0", "1.5", "4"])).toBe("85");
  });

  it("skips invalid entries and is empty when nothing is valid", () => {
    expect(calcGrundigkeitCm(["3.0", "", "x"])).toBe("30");
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
    expect(
      calcProfileFKOrNFK([h({ tiefe_oben: "0" })], 100, "fk_lm2"),
    ).toBeNull();
  });
});

describe("calcProfileSWert", () => {
  const base = { kak: "20", basensaettigung: "50", trockenrohdichte: "1,5" };

  it("weights A-horizons fully and all others by 0.5", () => {
    const profile = [
      h({ ...base, horizontname: "Ap", tiefe_oben: "0", tiefe_unten: "20" }),
      h({ ...base, horizontname: "Bv", tiefe_oben: "20", tiefe_unten: "40" }),
    ];
    // per horizon: 20 × 0.5 × 1.5 × 2 dm = 30 → Ap 30 + Bv 15
    expect(calcProfileSWert(profile, 100)).toBeCloseTo(45, 6);
  });

  it("recognises prefixed A-horizons (fAh) and clips at the limit", () => {
    const profile = [
      h({ ...base, horizontname: "fAh", tiefe_oben: "0", tiefe_unten: "40" }),
    ];
    // clipped to 0–20 cm = 2 dm → 30
    expect(calcProfileSWert(profile, 20)).toBeCloseTo(30, 6);
  });

  it("returns null when a horizon lacks KAK, BS or TRD", () => {
    const profile = [
      h({ horizontname: "Ah", tiefe_oben: "0", tiefe_unten: "20", kak: "20" }),
    ];
    expect(calcProfileSWert(profile, 100)).toBeNull();
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

  it("rateKAK covers every bucket from 'sehr gering' to 'sehr hoch'", () => {
    const labels = new Set(
      [0, 2, 4, 6, 8, 10, 15, 20, 30, 40, 60, 100].map(rateKAK),
    );
    expect(labels).toContain("sehr gering");
    expect(labels).toContain("sehr hoch");
  });
});
