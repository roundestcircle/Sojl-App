import { labToMunsell, linearRgbToMunsell } from "@/lib/color/munsellLookup";
import { MUNSELL_DATA } from "@/data/munsellData";

/** sRGB byte → linear light (IEC 61966-2-1). */
const toLinear = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

describe("labToMunsell", () => {
  // Every 50th chip keeps the test fast while covering all hue families.
  const sample = MUNSELL_DATA.filter((_, i) => i % 50 === 0);

  it.each(sample.map((c) => [c.munsell, c]))(
    "maps the exact Lab of %s back to itself",
    (_name, chip) => {
      const res = labToMunsell(chip.lab);
      expect(res.full).toBe(chip.munsell);
      expect(res.distance).toBeCloseTo(0, 6);
    },
  );
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
        r: toLinear(chip.r),
        g: toLinear(chip.g),
        b: toLinear(chip.b),
      });
      expect(res.distance).toBeLessThan(1);
    },
  );
});
