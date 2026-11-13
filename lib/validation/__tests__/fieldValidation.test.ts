import {
  validateTiefe,
  validatePh,
  validateBodenart,
  validateMunsell,
  tiefeOrderInvalid,
} from "@/lib/validation/fieldValidation";
import { bodenartToClay } from "@/lib/calc/bodenartClay";
import { lookupTrockenrohdichte } from "@/lib/calc/trockenrohdichteLookup";
import { SOIL_TABLE } from "@/lib/calc/poreLookup";
import { MUNSELL_DATA } from "@/data/munsellData";

describe("numeric validators", () => {
  it("accept empty input and the 'nb' sentinel", () => {
    expect(validateTiefe("")).toEqual({ valid: true });
    expect(validateTiefe(" NB ")).toEqual({ valid: true, normalized: "nb" });
  });

  it("accept a decimal comma", () => {
    expect(validatePh("5,5").valid).toBe(true);
  });

  it("reject out-of-range, non-integer and non-numeric values", () => {
    expect(validatePh("9.5").valid).toBe(false);
    expect(validateTiefe("12.5").valid).toBe(false);
    expect(validateTiefe("abc").valid).toBe(false);
  });

  it("returns a range suggestion on failure", () => {
    const res = validateTiefe("300");
    expect(res).toMatchObject({
      valid: false,
      suggestion: { kind: "range", min: 0, max: 250, unit: "cm" },
    });
  });
});

describe("validateBodenart", () => {
  it("normalises case to the canonical code", () => {
    expect(validateBodenart("su2")).toEqual({ valid: true, normalized: "Su2" });
  });

  it("rejects unknown codes with a list suggestion", () => {
    expect(validateBodenart("Xx")).toMatchObject({
      valid: false,
      suggestion: { kind: "list" },
    });
  });
});

describe("validateMunsell", () => {
  it("normalises spacing and case", () => {
    expect(validateMunsell("10yr  4/4")).toEqual({
      valid: true,
      normalized: "10YR 4/4",
    });
  });

  // The RIT renotation dataset only has even chroma steps, so odd chromas
  // (common on soil colour charts, e.g. 10YR 4/3) are currently rejected.
  // This pins the current behaviour; change it together with the validator.
  it("rejects odd chromas that are not in the RIT dataset", () => {
    expect(validateMunsell("10YR 4/3").valid).toBe(false);
  });

  it("rejects malformed notation", () => {
    expect(validateMunsell("braun").valid).toBe(false);
  });
});

describe("tiefeOrderInvalid", () => {
  it("flags oben ≥ unten only when both parse", () => {
    expect(tiefeOrderInvalid("30", "10")).toBe(true);
    expect(tiefeOrderInvalid("30", "30")).toBe(true);
    expect(tiefeOrderInvalid("0", "30")).toBe(false);
    expect(tiefeOrderInvalid("", "30")).toBe(false);
  });
});

// Cross-module consistency: every code the lookup tables know must also be
// accepted by the form validator, otherwise a calculable Bodenart would be
// shown as invalid while typing.
describe("lookup tables vs. validator", () => {
  const tableCodes = (has: (code: string) => boolean) =>
    [
      "Ss",
      "Sl2",
      "Sl3",
      "Sl4",
      "Slu",
      "St2",
      "St3",
      "Su2",
      "Su3",
      "Su4",
      "Ls2",
      "Ls3",
      "Ls4",
      "Lt2",
      "Lt3",
      "Lts",
      "Lu",
      "Uu",
      "Uls",
      "Us",
      "Ut2",
      "Ut3",
      "Ut4",
      "Tt",
      "Tl",
      "Tu2",
      "Tu3",
      "Tu4",
      "Ts2",
      "Ts3",
      "Ts4",
    ].filter(has);

  it.each(tableCodes((c) => bodenartToClay(c) !== null))(
    "%s from bodenartClay is a valid Bodenart",
    (code) => expect(validateBodenart(code).valid).toBe(true),
  );

  it.each(tableCodes((c) => lookupTrockenrohdichte(c, "Pd3") !== ""))(
    "%s from the TRD table is a valid Bodenart",
    (code) => expect(validateBodenart(code).valid).toBe(true),
  );

  it.each(Object.keys(SOIL_TABLE).filter((k) => /^[A-Z][a-z]+\d?$/.test(k)))(
    "%s from the pore table is a valid Bodenart",
    (code) => expect(validateBodenart(code).valid).toBe(true),
  );

  it("accepts every Munsell chip of the RIT dataset", () => {
    const rejected = MUNSELL_DATA.map((c) => c.munsell).filter(
      (m) => !validateMunsell(m).valid,
    );
    expect(rejected).toEqual([]);
  });
});
