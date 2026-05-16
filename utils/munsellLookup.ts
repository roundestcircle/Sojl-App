/**
 * Munsell Color Lookup and RGB to Munsell Conversion
 * Uses the official RIT Munsell Renotation Dataset with Delta-E color distance matching.
 * The dataset is stored in munsellData.ts as an array of objects with RGB and Munsell values.
 */

import { MUNSELL_DATA } from "./munsellData";

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Convert RGB to Lab color space for more accurate color distance calculation
 * Lab color space is more perceptually uniform than RGB
 */
function rgbToLab(rgb: RGBColor): { L: number; a: number; b: number } {
  // Normalize RGB to 0-1
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  // Apply gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Convert to XYZ
  const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  // Normalize by reference white point (D65)
  const xn = x / 0.95047;
  const yn = y / 1.0;
  const zn = z / 1.08883;

  // Convert to Lab
  const fx = xn > 0.008856 ? Math.pow(xn, 1 / 3) : 7.787 * xn + 16 / 116;
  const fy = yn > 0.008856 ? Math.pow(yn, 1 / 3) : 7.787 * yn + 16 / 116;
  const fz = zn > 0.008856 ? Math.pow(zn, 1 / 3) : 7.787 * zn + 16 / 116;

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const labB = 200 * (fy - fz);

  return { L, a, b: labB };
}

// Precomputed Lab values for every MUNSELL_DATA entry. Built once at module load
// so each lookup only converts the input color rather than 2N entries per call.
const MUNSELL_LAB = MUNSELL_DATA.map((e) =>
  rgbToLab({ r: e.r, g: e.g, b: e.b }),
);

/**
 * Find the closest Munsell color for a given RGB color via CIE76 Delta-E in Lab space.
 */
export function rgbToMunsell(rgb: RGBColor): {
  full: string;
  distance: number;
} {
  const inputLab = rgbToLab(rgb);
  let closestIdx = 0;
  // Squared distance: avoids one sqrt per entry; we sqrt the winner at the end.
  let minDistSq = Infinity;

  for (let i = 0; i < MUNSELL_LAB.length; i++) {
    const lab = MUNSELL_LAB[i];
    const dL = inputLab.L - lab.L;
    const da = inputLab.a - lab.a;
    const db = inputLab.b - lab.b;
    const distSq = dL * dL + da * da + db * db;
    if (distSq < minDistSq) {
      minDistSq = distSq;
      closestIdx = i;
    }
  }

  return {
    full: MUNSELL_DATA[closestIdx].munsell,
    distance: Math.sqrt(minDistSq),
  };
}
