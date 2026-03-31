/**
 * Munsell Color Lookup and RGB to Munsell Conversion
 * Uses the official RIT Munsell Renotation Dataset with Delta-E color distance matching.
 *
 * To regenerate the data file, download real.dat from:
 *   http://www.rit-mcsl.org/MunsellRenotation/real.dat
 * Place it in the project root, then run:
 *   node scripts/generateMunsellData.js
 */

import { MUNSELL_DATA } from './munsellData';

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
  const fx = xn > 0.008856 ? Math.pow(xn, 1 / 3) : (7.787 * xn + 16 / 116);
  const fy = yn > 0.008856 ? Math.pow(yn, 1 / 3) : (7.787 * yn + 16 / 116);
  const fz = zn > 0.008856 ? Math.pow(zn, 1 / 3) : (7.787 * zn + 16 / 116);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const labB = 200 * (fy - fz);

  return { L, a, b: labB };
}

/**
 * Calculate Delta-E (CIE76) color distance between two RGB colors
 * Lower values mean more similar colors
 */
function calculateColorDistance(color1: RGBColor, color2: RGBColor): number {
  const lab1 = rgbToLab(color1);
  const lab2 = rgbToLab(color2);

  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;

  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Find the closest Munsell color for a given RGB color
 */
export function rgbToMunsell(rgb: RGBColor): { full: string; distance: number } {
  let closestEntry = MUNSELL_DATA[0];
  let minDistance = calculateColorDistance(rgb, { r: closestEntry.r, g: closestEntry.g, b: closestEntry.b });

  for (const entry of MUNSELL_DATA) {
    const entryRgb = { r: entry.r, g: entry.g, b: entry.b };
    const distance = calculateColorDistance(rgb, entryRgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestEntry = entry;
    }
  }

  return {
    full: closestEntry.munsell,
    distance: minDistance,
  };
}
