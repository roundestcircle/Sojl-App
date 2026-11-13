import {
  averageLinearRgba,
  linearToSrgb,
  linearToSrgb255,
  SRGB8_TO_LINEAR,
  srgbToLinear,
} from "@/lib/color/colorMath";

describe("sRGB transfer functions", () => {
  it("maps the end points and the reference grey", () => {
    expect(srgbToLinear(0)).toBe(0);
    expect(srgbToLinear(1)).toBeCloseTo(1, 12);
    // sRGB 128 ≈ 0.2159 linear (IEC 61966-2-1).
    expect(srgbToLinear(128 / 255)).toBeCloseTo(0.21586, 5);
  });

  it("round-trips every 8-bit value", () => {
    for (let i = 0; i < 256; i++) {
      expect(Math.round(linearToSrgb(srgbToLinear(i / 255)) * 255)).toBe(i);
    }
  });

  it("builds the lookup table from srgbToLinear", () => {
    for (let i = 0; i < 256; i++) {
      expect(SRGB8_TO_LINEAR[i]).toBe(Math.fround(srgbToLinear(i / 255)));
    }
  });
});

describe("linearToSrgb255", () => {
  it("re-encodes every 8-bit grey exactly", () => {
    for (let i = 0; i < 256; i++) {
      const v = srgbToLinear(i / 255);
      expect(linearToSrgb255({ r: v, g: v, b: v })).toEqual({
        r: i,
        g: i,
        b: i,
      });
    }
  });

  it("clamps out-of-range input", () => {
    expect(linearToSrgb255({ r: -0.5, g: 1.5, b: 2 })).toEqual({
      r: 0,
      g: 255,
      b: 255,
    });
  });
});

describe("averageLinearRgba", () => {
  it("averages in linear light, not in sRGB bytes", () => {
    // One black and one white pixel: the linear mean is 0.5, which encodes to
    // sRGB 188 — not the gamma-biased byte mean of 128.
    const px = new Uint8Array([0, 0, 0, 255, 255, 255, 255, 255]);
    const mean = averageLinearRgba(px);
    expect(mean.r).toBeCloseTo(0.5, 6);
    expect(linearToSrgb255(mean).r).toBe(188);
  });

  it("keeps channels apart and ignores alpha", () => {
    const px = new Uint8Array([255, 0, 128, 0, 255, 0, 128, 17]);
    const mean = averageLinearRgba(px);
    expect(mean.r).toBeCloseTo(SRGB8_TO_LINEAR[255], 6);
    expect(mean.g).toBeCloseTo(0, 6);
    expect(mean.b).toBeCloseTo(SRGB8_TO_LINEAR[128], 6);
  });

  it("returns black for an empty buffer", () => {
    expect(averageLinearRgba(new Uint8Array(0))).toEqual({ r: 0, g: 0, b: 0 });
  });
});
