/**
 * Munsell Color Lookup and RGB to Munsell Conversion
 * Uses the official RIT Munsell Renotation Dataset with CIEDE2000 color-distance matching.
 * The dataset is stored in munsellData.ts as an array of objects with RGB, Munsell, and
 * precomputed CIE-Lab values.
 */

import { MUNSELL_DATA } from "./munsellData";

interface LabColor {
  L: number;
  a: number;
  b: number;
}

/**
 * Convert a linear-light sRGB color (channels in 0..1) to CIE-Lab (D65).
 * The extractor already works in linear light, so matching from these values
 * avoids re-encoding to 8-bit sRGB and back — that round-trip quantizes dark
 * colors and inflates their chroma.
 */
function linearRgbToLab(r: number, g: number, b: number): LabColor {
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

  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

const DEG = Math.PI / 180;
const POW25_7 = Math.pow(25, 7);

/**
 * CIEDE2000 color difference between two Lab colors (kL = kC = kH = 1).
 * More perceptually accurate than the Euclidean CIE76 distance, especially in
 * the low-chroma region where soil colors sit — this reduces neighbouring
 * chips being picked over the true closest one.
 */
function ciede2000(lab1: LabColor, lab2: LabColor): number {
  const { L: L1, a: a1, b: b1 } = lab1;
  const { L: L2, a: a2, b: b2 } = lab2;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cbar = (C1 + C2) / 2;
  const Cbar7 = Math.pow(Cbar, 7);
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + POW25_7)));

  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  let h1p = Math.atan2(b1, a1p);
  if (h1p < 0) h1p += 2 * Math.PI;
  let h2p = Math.atan2(b2, a2p);
  if (h2p < 0) h2p += 2 * Math.PI;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > Math.PI) dhp -= 2 * Math.PI;
    else if (dhp < -Math.PI) dhp += 2 * Math.PI;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp / 2);

  const Lbarp = (L1 + L2) / 2;
  const Cbarp = (C1p + C2p) / 2;

  let hbarp: number;
  if (C1p * C2p === 0) {
    hbarp = h1p + h2p;
  } else if (Math.abs(h1p - h2p) > Math.PI) {
    hbarp =
      h1p + h2p < 2 * Math.PI
        ? (h1p + h2p + 2 * Math.PI) / 2
        : (h1p + h2p - 2 * Math.PI) / 2;
  } else {
    hbarp = (h1p + h2p) / 2;
  }

  const T =
    1 -
    0.17 * Math.cos(hbarp - 30 * DEG) +
    0.24 * Math.cos(2 * hbarp) +
    0.32 * Math.cos(3 * hbarp + 6 * DEG) -
    0.2 * Math.cos(4 * hbarp - 63 * DEG);

  const dTheta = 30 * DEG * Math.exp(-Math.pow((hbarp / DEG - 275) / 25, 2));
  const Cbarp7 = Math.pow(Cbarp, 7);
  const RC = 2 * Math.sqrt(Cbarp7 / (Cbarp7 + POW25_7));
  const SL =
    1 +
    (0.015 * Math.pow(Lbarp - 50, 2)) / Math.sqrt(20 + Math.pow(Lbarp - 50, 2));
  const SC = 1 + 0.045 * Cbarp;
  const SH = 1 + 0.015 * Cbarp * T;
  const RT = -Math.sin(2 * dTheta) * RC;

  const termL = dLp / SL;
  const termC = dCp / SC;
  const termH = dHp / SH;

  return Math.sqrt(
    termL * termL + termC * termC + termH * termH + RT * termC * termH,
  );
}

/**
 * Find the closest Munsell color for a given Lab color via CIEDE2000.
 */
export function labToMunsell(inputLab: LabColor): {
  full: string;
  distance: number;
} {
  let closestIdx = 0;
  let minDist = Infinity;

  for (let i = 0; i < MUNSELL_DATA.length; i++) {
    const dist = ciede2000(inputLab, MUNSELL_DATA[i].lab);
    if (dist < minDist) {
      minDist = dist;
      closestIdx = i;
    }
  }

  return {
    full: MUNSELL_DATA[closestIdx].munsell,
    distance: minDist,
  };
}

/**
 * Find the closest Munsell color for a linear-light sRGB color (channels in
 * 0..1). Preferred entry point for the extractor, which already works in
 * linear light — avoids the lossy 8-bit re-encode before matching.
 */
export function linearRgbToMunsell(lin: { r: number; g: number; b: number }): {
  full: string;
  distance: number;
} {
  return labToMunsell(linearRgbToLab(lin.r, lin.g, lin.b));
}
