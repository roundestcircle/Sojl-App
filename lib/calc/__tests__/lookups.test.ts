import {
  bodenartToClay,
  bodenartToClayMidpoint,
} from "@/lib/calc/bodenartClay";
import { lookupTrockenrohdichte } from "@/lib/calc/trockenrohdichteLookup";
import {
  SOIL_TABLE,
  bodenartToLookupKey,
  parseDensityMidpoint,
  lookupPoreValues,
} from "@/lib/calc/poreLookup";
import {
  estimateHumus,
  chromaToClass,
  parseMunsell,
  humusKlasse,
} from "@/lib/calc/renger1987";
import { calcKAK } from "@/lib/calc/mappingMaths";
import {
  calcBasensaettigung,
  humusGroupLabel,
} from "@/lib/calc/basensaettigungLookup";

describe("bodenartClay (KA6 Tabelle C51)", () => {
  it("returns the clay range for a code, ignoring surrounding whitespace", () => {
    expect(bodenartToClay(" Ls2 ")).toEqual({ min: 17, max: 25 });
  });

  it("returns the rounded midpoint", () => {
    expect(bodenartToClayMidpoint("Ls2")).toBe(21);
    expect(bodenartToClayMidpoint("Tt")).toBe(83);
  });

  it("returns null for unknown codes", () => {
    expect(bodenartToClay("Xx")).toBeNull();
    expect(bodenartToClayMidpoint("")).toBeNull();
  });
});

describe("lookupTrockenrohdichte (KA6 Tabelle B2)", () => {
  it("reads the Pd column and formats with a decimal comma", () => {
    expect(lookupTrockenrohdichte("Ss", "Pd1")).toBe("1,18");
    expect(lookupTrockenrohdichte("Ss", "pd5")).toBe("1,98");
  });

  it("increases monotonically from Pd1 to Pd5", () => {
    const values = [1, 2, 3, 4, 5].map((pd) =>
      parseFloat(lookupTrockenrohdichte("Lu", `Pd${pd}`).replace(",", ".")),
    );
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });

  it("is empty for unknown Bodenart or Pd class", () => {
    expect(lookupTrockenrohdichte("Xx", "Pd3")).toBe("");
    expect(lookupTrockenrohdichte("Lu", "nb")).toBe("");
    expect(lookupTrockenrohdichte("Lu", "Pd6")).toBe("");
  });
});

describe("poreLookup (KA6 Tabellen B3/B6/B9)", () => {
  it("maps bare group codes to their first subdivision", () => {
    expect(bodenartToLookupKey("Su2")).toBe("Su2");
    expect(bodenartToLookupKey("Su")).toBe("Su2");
    expect(bodenartToLookupKey("Xx")).toBeNull();
  });

  it.each([
    ["1,2–1,4 kg/dm³", 1.3],
    ["1.2 - 1.4", 1.3],
    [">1.65", 1.8],
    ["<1.45", 1.3],
    ["1,6", 1.6],
  ])("parses density %p as %p", (input, expected) => {
    expect(parseDensityMidpoint(input)).toBeCloseTo(expected, 6);
  });

  it("returns null for unparseable density", () => {
    expect(parseDensityMidpoint("hoch")).toBeNull();
  });

  it("returns the table row exactly at a TRD support point", () => {
    const row = SOIL_TABLE.Ss[1];
    const res = lookupPoreValues("Ss", String(row.trd));
    expect(res).toEqual({
      airCapacity: row.lk,
      fieldCapacity: row.fk,
      availableWater: row.nfk,
      totalPorosity: row.lk + row.fk,
    });
  });

  it("interpolates linearly between support points", () => {
    const [a, b] = SOIL_TABLE.Ss;
    const mid = (a.trd + b.trd) / 2;
    const res = lookupPoreValues("Ss", String(mid));
    expect(res?.airCapacity).toBeCloseTo((a.lk + b.lk) / 2, 6);
    expect(res?.fieldCapacity).toBeCloseTo((a.fk + b.fk) / 2, 6);
  });

  it("clamps outside the tabulated TRD range", () => {
    const rows = SOIL_TABLE.Ss;
    expect(lookupPoreValues("Ss", "0.5")?.airCapacity).toBe(rows[0].lk);
    expect(lookupPoreValues("Ss", "2.5")?.airCapacity).toBe(
      rows[rows.length - 1].lk,
    );
  });

  it("has nFK ≤ FK in every table row", () => {
    for (const [key, rows] of Object.entries(SOIL_TABLE)) {
      for (const r of rows) {
        expect({ key, trd: r.trd, ok: r.nfk <= r.fk }).toEqual({
          key,
          trd: r.trd,
          ok: true,
        });
      }
    }
  });
});

describe("renger1987 (Humusgehalt)", () => {
  it("parses Munsell value/chroma", () => {
    expect(parseMunsell("10YR 4/3")).toEqual({ value: 4, chroma: 3 });
    expect(parseMunsell("7.5YR 2.5 / 1")).toEqual({ value: 2.5, chroma: 1 });
    expect(parseMunsell("braun")).toBeNull();
  });

  it("classifies chroma", () => {
    expect(chromaToClass(2)).toBe("low");
    expect(chromaToClass(3.5)).toBe("mid");
    expect(chromaToClass(6)).toBe("mid");
    expect(chromaToClass(8)).toBe("high");
  });

  it.each(["low", "mid", "high"] as const)(
    "estimates more humus for darker soils (chroma %s)",
    (chroma) => {
      expect(estimateHumus(3, chroma, 5, 25)).toBeGreaterThan(
        estimateHumus(7, chroma, 5, 25),
      );
    },
  );

  it("clamps inputs outside the diagram to its edges", () => {
    expect(estimateHumus(5, "mid", 5, 100)).toBe(
      estimateHumus(5, "mid", 5, 65),
    );
    expect(estimateHumus(5, "mid", 1, 25)).toBe(estimateHumus(5, "mid", 3, 25));
  });

  it("rounds to one decimal", () => {
    const v = estimateHumus(4.3, "mid", 5.7, 17);
    expect(Math.round(v * 10) / 10).toBe(v);
  });

  it.each([
    [0.5, "h1"],
    [1, "h2"],
    [4.9, "h3"],
    [5, "h4"],
    [12, "h5"],
    [20, "h6"],
  ])("assigns %p %% to Humusklasse %p (KA6 C33)", (pct, klasse) => {
    expect(humusKlasse(pct).klasse).toBe(klasse);
  });
});

describe("calcKAK", () => {
  it("adds the humus contribution (factor × %) to the mineral base value", () => {
    expect(calcKAK("Lu", "Mull", "2")).toBe("20.0"); // 15 + 2.5 × 2
    expect(calcKAK("Lu", "Rohhumus", "2")).toBe("18.0"); // 15 + 1.5 × 2
  });

  it("uses only the mineral base without Humusform or humus %", () => {
    expect(calcKAK("Lu", "", "2")).toBe("15.0");
    expect(calcKAK("Lu", "Mull", "")).toBe("15.0");
  });

  it("is empty for unknown Bodenart", () => {
    expect(calcKAK("Xx", "Mull", "2")).toBe("");
  });
});

describe("calcBasensaettigung", () => {
  it("is empty without pH or humus", () => {
    expect(calcBasensaettigung("", "2")).toBe("");
    expect(calcBasensaettigung("5", " ")).toBe("");
  });

  it.each(["2", "8", "20"])(
    "rises with pH and stays within 0–100 %% (humus %s %%)",
    (humus) => {
      const values = [3, 4, 5, 6, 7].map((ph) =>
        parseFloat(calcBasensaettigung(String(ph), humus)),
      );
      expect([...values].sort((a, b) => a - b)).toEqual(values);
      values.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
      });
    },
  );

  it("labels the humus groups at their boundaries", () => {
    expect(humusGroupLabel("4")).toBe("≤ 4 % Humus");
    expect(humusGroupLabel("4.1")).toBe("4 – 15 % Humus");
    expect(humusGroupLabel("15")).toBe("≥ 15 % Humus");
    expect(humusGroupLabel("x")).toBeNull();
  });
});
