/**
 * Pure sRGB / linear-light helpers for the colour pipeline. No React, Expo or
 * Skia imports, so everything here is unit-testable.
 *
 * All colour math (averaging, white balance, Lab conversion) runs in linear
 * light; only the display value is re-encoded to sRGB.
 */

/**
 * RGB triplet. Used for sRGB bytes (0–255) as well as for linear light (0–1);
 * the variable name says which one.
 */
export type RGB = { r: number; g: number; b: number };

/** sRGB transfer function (IEC 61966-2-1): encoded 0..1 → linear 0..1. */
export const srgbToLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

/** Inverse sRGB transfer function: linear 0..1 → encoded 0..1. */
export const linearToSrgb = (c: number): number =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;

/**
 * Precomputed sRGB-byte → linear lookup. Pixel data is 8-bit, so there are
 * only 256 possible inputs; this turns a Math.pow per channel per pixel into a
 * single array index. Values are identical to `srgbToLinear(byte / 255)`
 * stored as float32.
 */
export const SRGB8_TO_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) SRGB8_TO_LINEAR[i] = srgbToLinear(i / 255);

/** Encode a linear-light colour (clamped to 0..1) as sRGB 0–255 integers. */
export const linearToSrgb255 = (c: RGB): RGB => {
  const enc = (v: number) =>
    Math.round(linearToSrgb(Math.max(0, Math.min(1, v))) * 255);
  return { r: enc(c.r), g: enc(c.g), b: enc(c.b) };
};

/**
 * Mean colour of a contiguous RGBA_8888 pixel buffer (4 bytes per pixel, alpha
 * ignored) in linear light. Each byte is linearised before summing, so the
 * mean is a radiometric average rather than a gamma-biased one. Returns black
 * for an empty buffer.
 */
export function averageLinearRgba(pixels: ArrayLike<number>): RGB {
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  const pixelCount = Math.floor(pixels.length / 4);

  for (let i = 0; i < pixelCount * 4; i += 4) {
    rSum += SRGB8_TO_LINEAR[pixels[i]];
    gSum += SRGB8_TO_LINEAR[pixels[i + 1]];
    bSum += SRGB8_TO_LINEAR[pixels[i + 2]];
  }

  if (pixelCount === 0) return { r: 0, g: 0, b: 0 };
  return { r: rSum / pixelCount, g: gSum / pixelCount, b: bSum / pixelCount };
}
