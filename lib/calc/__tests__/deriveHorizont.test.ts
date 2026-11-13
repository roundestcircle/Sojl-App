import {
  deriveHorizont,
  HORIZONT_DERIVED_FIELDS,
  type HorizontCalcInputs,
} from "@/lib/calc/deriveHorizont";

const inputs = (
  over: Partial<HorizontCalcInputs> = {},
): HorizontCalcInputs => ({
  farbe_munsell: "10YR 3/2",
  ph_cacl2: "5.9",
  tonanteil: "12.5",
  bodenart: "Ls3",
  packungsdichte: "Pd3",
  tiefe_oben: "0",
  tiefe_unten: "30",
  anteil: "10",
  humusform: "Mull",
  ...over,
});

describe("deriveHorizont", () => {
  it("fills every derived field for complete inputs", () => {
    const d = deriveHorizont(inputs());
    for (const f of HORIZONT_DERIVED_FIELDS) expect(d[f]).not.toBe("");
    expect(d.maechtigk_dm).toBe("3.0");
    expect(d.trockenrohdichte).toBe("1,51");
  });

  it("gives identical results for decimal comma and dot", () => {
    const dot = deriveHorizont(inputs());
    const comma = deriveHorizont(
      inputs({ ph_cacl2: "5,9", tonanteil: "12,5" }),
    );
    expect(comma).toEqual(dot);
  });

  it("chains Humus % into Humusklasse, KAK, Basensättigung and pores", () => {
    const withoutColour = deriveHorizont(inputs({ farbe_munsell: "" }));
    expect(withoutColour.humus_pct).toBe("");
    expect(withoutColour.humus).toBe("");
    expect(withoutColour.kak).toBe("");
    expect(withoutColour.basensaettigung).toBe("");
    expect(withoutColour.gpv_pct).toBe("");
    // TRD and Mächtigkeit don't depend on humus
    expect(withoutColour.trockenrohdichte).toBe("1,51");
    expect(withoutColour.maechtigk_dm).toBe("3.0");
  });

  it("leaves KAK empty without Humusform", () => {
    expect(deriveHorizont(inputs({ humusform: "" })).kak).toBe("");
  });

  it("leaves l/m² values empty without depths but keeps Vol%", () => {
    const d = deriveHorizont(inputs({ tiefe_unten: "" }));
    expect(d.maechtigk_dm).toBe("");
    expect(d.fk_pct).not.toBe("");
    expect(d.fk_lm2).toBe("");
  });

  it("treats 'nb' inputs as missing", () => {
    const d = deriveHorizont(inputs({ ph_cacl2: "nb" }));
    expect(d.humus_pct).toBe("");
    expect(d.basensaettigung).toBe("");
  });
});
