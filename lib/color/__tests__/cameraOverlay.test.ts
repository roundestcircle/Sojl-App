import {
  getSamplingRect,
  orientationMatches,
  OVERLAY_DISPLAY,
  OVERLAY_SAMPLE,
  type OverlayRect,
} from "@/lib/color/cameraOverlay";

const overlaps = (a: OverlayRect, b: OverlayRect) =>
  a.left < b.left + b.width &&
  b.left < a.left + a.width &&
  a.top < b.top + b.height &&
  b.top < a.top + a.height;

describe("overlay fractions", () => {
  it("keeps the grey-card sample band inside its guide box", () => {
    const d = OVERLAY_DISPLAY.greyCard;
    const s = OVERLAY_SAMPLE.greyCard;
    expect(s.top).toBeGreaterThanOrEqual(d.top);
    expect(s.left).toBeGreaterThanOrEqual(d.left);
    expect(s.top + s.height).toBeLessThanOrEqual(d.top + d.height);
    expect(s.left + s.width).toBeLessThanOrEqual(d.left + d.width);
  });

  it("does not let the grey-card band overlap the soil box", () => {
    expect(overlaps(OVERLAY_SAMPLE.greyCard, OVERLAY_SAMPLE.soilSample)).toBe(
      false,
    );
  });

  it("samples the soil box exactly where it is shown", () => {
    expect(OVERLAY_SAMPLE.soilSample).toEqual(OVERLAY_DISPLAY.soilSample);
  });
});

describe("getSamplingRect", () => {
  it("uses the full photo when photo and preview aspect match", () => {
    // 3000×4000 photo, 3:4 preview → nothing cropped.
    expect(getSamplingRect("greyCard", 3000, 4000, 0.75)).toEqual({
      top: 1000,
      left: 600,
      width: 1800,
      height: 1400,
    });
  });

  it("crops the sides for a portrait preview narrower than the photo", () => {
    // Preview 1:2 → visible width 4000·0.5 = 2000, offset (3000-2000)/2 = 500.
    expect(getSamplingRect("greyCard", 3000, 4000, 0.5)).toEqual({
      top: 1000,
      left: 900,
      width: 1200,
      height: 1400,
    });
    expect(getSamplingRect("soilSample", 3000, 4000, 0.5)).toEqual({
      top: 2600,
      left: 1340,
      width: 320,
      height: 400,
    });
  });

  it("crops top and bottom for a preview wider than the photo", () => {
    // Portrait photo 3000×4000, preview 0.9 → visible height 3000/0.9 ≈ 3333.3,
    // offset ≈ 333.3.
    const rect = getSamplingRect("soilSample", 3000, 4000, 0.9);
    const visHeight = 3000 / 0.9;
    const offsetY = (4000 - visHeight) / 2;
    expect(rect).toEqual({
      top: Math.floor(offsetY + visHeight * 0.65),
      left: Math.floor(3000 * 0.42),
      width: Math.floor(3000 * 0.16),
      height: Math.floor(visHeight * 0.1),
    });
  });

  it("handles a landscape preview with a landscape photo", () => {
    // 4000×3000 photo, 2:1 preview → visible height 2000, offset 500.
    expect(getSamplingRect("greyCard", 4000, 3000, 2)).toEqual({
      top: 1000,
      left: 800,
      width: 2400,
      height: 700,
    });
  });

  it.each([
    [3000, 4000, 0.45],
    [3000, 4000, 0.75],
    [3000, 4000, 1.2],
    [4000, 3000, 2.1],
    [4000, 3000, 0.6],
    [1080, 1920, 0.5625],
  ])("stays inside the %i×%i photo for preview aspect %f", (w, h, aspect) => {
    for (const type of ["greyCard", "soilSample"] as const) {
      const r = getSamplingRect(type, w, h, aspect);
      expect(r.top).toBeGreaterThanOrEqual(0);
      expect(r.left).toBeGreaterThanOrEqual(0);
      expect(r.width).toBeGreaterThan(0);
      expect(r.height).toBeGreaterThan(0);
      expect(r.top + r.height).toBeLessThanOrEqual(h);
      expect(r.left + r.width).toBeLessThanOrEqual(w);
    }
  });

  it.each([0, -1, NaN, Infinity])(
    "rejects an invalid preview aspect (%f)",
    (aspect) => {
      expect(() => getSamplingRect("greyCard", 3000, 4000, aspect)).toThrow();
    },
  );
});

describe("orientationMatches", () => {
  it("accepts portrait photo with portrait preview", () => {
    expect(orientationMatches(3000, 4000, 0.5)).toBe(true);
  });

  it("accepts landscape photo with landscape preview", () => {
    expect(orientationMatches(4000, 3000, 2)).toBe(true);
  });

  it("rejects a landscape photo for a portrait preview", () => {
    expect(orientationMatches(4000, 3000, 0.5)).toBe(false);
  });

  it("rejects a portrait photo for a landscape preview", () => {
    expect(orientationMatches(3000, 4000, 2)).toBe(false);
  });

  it("treats square photos and previews as portrait", () => {
    expect(orientationMatches(3000, 3000, 0.5)).toBe(true);
    expect(orientationMatches(3000, 3000, 1)).toBe(true);
    expect(orientationMatches(4000, 3000, 1)).toBe(false);
  });
});
