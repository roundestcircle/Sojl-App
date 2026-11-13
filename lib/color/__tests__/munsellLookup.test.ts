import {
  ciede2000,
  labToMunsell,
  linearRgbToMunsell,
  POOR_MATCH_DELTA_E00,
} from "@/lib/color/munsellLookup";
import { srgbToLinear } from "@/lib/color/colorMath";
import { MUNSELL_DATA } from "@/data/munsellData";

describe("ciede2000", () => {
  // Reference pairs from Sharma, Wu & Dalal (2005), "The CIEDE2000
  // color-difference formula: implementation notes, supplementary test data
  // and mathematical observations", Table 1.
  it.each([
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
    [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615],
    [[50, 2.8361, -74.02], [50, 0, -82.7485], 3.4412],
    [[50, 0, 0], [50, -1, 2], 2.3669],
    // Hue-angle discontinuity around a' = 0 / b' = 0.
    [[50, 2.49, -0.001], [50, -2.49, 0.0009], 7.1792],
    [[50, 2.49, -0.001], [50, -2.49, 0.0011], 7.2195],
    [[50, -0.001, 2.49], [50, 0.0009, -2.49], 4.8045],
    [[50, -0.001, 2.49], [50, 0.0011, -2.49], 4.7461],
    [[50, 2.5, 0], [73, 25, -18], 27.1492],
    [[50, 2.5, 0], [61, -5, 29], 22.8977],
    [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
  ])("%j vs %j → ΔE00 %f", ([L1, a1, b1], [L2, a2, b2], expected) => {
    const lab1 = { L: L1, a: a1, b: b1 };
    const lab2 = { L: L2, a: a2, b: b2 };
    expect(ciede2000(lab1, lab2)).toBeCloseTo(expected, 3);
    // Symmetric.
    expect(ciede2000(lab2, lab1)).toBeCloseTo(expected, 3);
  });
});

describe("labToMunsell", () => {
  // Every 50th chip keeps the test fast while covering all hue families.
  const sample = MUNSELL_DATA.filter((_, i) => i % 50 === 0);

  it.each(sample.map((c) => [c.munsell, c]))(
    "maps a slightly shifted Lab of %s back to that chip",
    (_name, chip) => {
      // A small offset (well below the spacing between chips) must not move
      // the match to a neighbour, and the reported distance must reflect it.
      const shifted = {
        L: chip.lab.L + 0.3,
        a: chip.lab.a - 0.2,
        b: chip.lab.b + 0.2,
      };
      const res = labToMunsell(shifted);
      expect(res.munsell).toBe(chip.munsell);
      expect(res.distance).toBeCloseTo(ciede2000(shifted, chip.lab), 10);
      expect(res.distance).toBeGreaterThan(0);
      expect(res.distance).toBeLessThan(1);
    },
  );

  it("flags a colour outside the chip range as a poor match", () => {
    // Pure black is darker than the darkest chip (Value 1).
    const res = linearRgbToMunsell({ r: 0, g: 0, b: 0 });
    expect(res.distance).toBeGreaterThan(POOR_MATCH_DELTA_E00);
  });
});

describe("linearRgbToMunsell", () => {
  it.each(
    MUNSELL_DATA.filter((_, i) => i % 75 === 0).map((c) => [c.munsell, c]),
  )(
    "finds %s (or an adjacent chip) from its 8-bit sRGB display value",
    (_name, chip) => {
      // The stored r,g,b are rounded to 8 bit, so the match may land on a
      // neighbouring chip — but it must stay perceptually very close.
      const res = linearRgbToMunsell({
        r: srgbToLinear(chip.r / 255),
        g: srgbToLinear(chip.g / 255),
        b: srgbToLinear(chip.b / 255),
      });
      expect(res.distance).toBeLessThan(1);
    },
  );
});
