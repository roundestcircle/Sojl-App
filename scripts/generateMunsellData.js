/**
 * Generates munsellData.ts from the official RIT Munsell Renotation Dataset.
 *
 * Download real.dat from:
 *   http://www.rit-mcsl.org/MunsellRenotation/real.dat
 *
 * It is checked in at scripts/data/real.dat, so just run:
 *   node scripts/generateMunsellData.js
 */

const fs = require("fs");
const path = require("path");

// --- Color math utilities ---

/**
 * Bradford chromatic adaptation, illuminant C -> D65, as one 3x3 matrix
 * (M_inv · diag(cone_D65 / cone_C) · M).
 *
 * White points: C x=0.3101, y=0.3162 -> XYZ 0.98074 / 1.0 / 1.18232;
 *               D65 x=0.3127, y=0.3290 -> XYZ 0.95047 / 1.0 / 1.08883.
 * Bradford M = [[0.8951, 0.2664, -0.1614], [-0.7502, 1.7135, 0.0367],
 *               [0.0389, -0.0685, 1.0296]].
 *
 * The values are the bit-exact result of the former runtime computation, which
 * used the commonly published 4-decimal Bradford inverse
 * [[0.987, -0.1471, 0.16], [0.4323, 0.5184, 0.0493], [-0.0085, 0.04, 0.9685]]
 * instead of the exact inverse of M. Kept that way so the generated
 * munsellData.ts stays identical; an exact inverse would only shift the
 * stored Lab values in the last digits.
 */
const ADAPT_C_TO_D65 = [
  [0.990490178131999, -0.007248612706769519, -0.01158311268109058],
  [-0.012405871715746336, 1.015662417447792, -0.0029176132973229574],
  [-0.0035050057701805568, 0.006701635013691018, 0.9181632662657789],
];

function matMul3(M, v) {
  return [
    M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
    M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
    M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2],
  ];
}

// D65 reference white (XYZ, Y normalized to 1) used for the CIE-Lab transform.
const D65_WHITE = [0.95047, 1.0, 1.08883];

/**
 * Convert CIE xyY (illuminant C) to XYZ already chromatically adapted to D65.
 * Y is normalized to the 0..~1 range. Returns null for degenerate y === 0.
 */
function xyYtoXYZ_D65(x, y, Y_val) {
  if (y === 0) return null;

  // xyY -> XYZ. The renotation data Y is in the 0-100 scale; normalize to 0..1.
  const Y_norm = Y_val / 100;
  const X = (x * Y_norm) / y;
  const Z = ((1 - x - y) * Y_norm) / y;

  // Chromatic adaptation: illuminant C -> D65
  return matMul3(ADAPT_C_TO_D65, [X, Y_norm, Z]);
}

/**
 * Convert XYZ (D65, Y in 0..1) to sRGB (0-255).
 * Returns null if the color is outside the sRGB gamut.
 */
function xyzD65toSRGB([Xd, Yd, Zd]) {
  // XYZ (D65) -> linear sRGB
  const rLin = 3.2406 * Xd - 1.5372 * Yd - 0.4986 * Zd;
  const gLin = -0.9689 * Xd + 1.8758 * Yd + 0.0415 * Zd;
  const bLin = 0.0557 * Xd - 0.204 * Yd + 1.057 * Zd;

  // Check gamut
  if (rLin < -0.001 || gLin < -0.001 || bLin < -0.001) return null;
  if (rLin > 1.001 || gLin > 1.001 || bLin > 1.001) return null;

  // Gamma correction (sRGB)
  function gammaCorrect(c) {
    c = Math.max(0, Math.min(1, c));
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  }

  const r = Math.round(gammaCorrect(rLin) * 255);
  const g = Math.round(gammaCorrect(gLin) * 255);
  const b = Math.round(gammaCorrect(bLin) * 255);

  return {
    r: Math.max(0, Math.min(255, r)),
    g: Math.max(0, Math.min(255, g)),
    b: Math.max(0, Math.min(255, b)),
  };
}

/**
 * Convert XYZ (D65, Y in 0..1) to CIE-Lab.
 * Computed directly from XYZ so the stored Lab carries full precision rather
 * than being round-tripped through gamut-clipped, 8-bit sRGB.
 */
function xyzD65toLab([X, Y, Z]) {
  const xr = X / D65_WHITE[0];
  const yr = Y / D65_WHITE[1];
  const zr = Z / D65_WHITE[2];

  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const fx = f(xr);
  const fy = f(yr);
  const fz = f(zr);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

const round3 = (n) => Math.round(n * 1000) / 1000;

/**
 * Format Munsell notation "HUE VALUE/CHROMA". real.dat only contains integer
 * values and chromas, so the numbers are printed as they are.
 */
function formatMunsell(hue, value, chroma) {
  return `${hue} ${value}/${chroma}`;
}

// --- Main ---

function main() {
  const inputPath = path.join(__dirname, "data", "real.dat");
  const outputPath = path.join(__dirname, "..", "data", "munsellData.ts");

  if (!fs.existsSync(inputPath)) {
    console.error("Error: real.dat not found in scripts/data/.");
    console.error(
      "Download it from: http://www.rit-mcsl.org/MunsellRenotation/real.dat",
    );
    console.error("Place it in: " + path.join(__dirname, "data"));
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf-8");
  const lines = raw.split("\n");

  const entries = [];
  let skippedOutOfGamut = 0;
  let skippedParsing = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines and the column header "h V C x y Y".
    if (!trimmed || /^h\s/i.test(trimmed)) continue;

    // Format: hue value chroma x y Y, e.g. "2.5YR 3 4 0.3629 0.2710 1.210".
    const parts = trimmed.split(/\s+/);
    if (parts.length !== 6) {
      skippedParsing++;
      continue;
    }
    const hue = parts[0];
    const [value, chroma, x, y, Y_val] = parts.slice(1).map(Number);

    if ([value, chroma, x, y, Y_val].some((n) => isNaN(n))) {
      skippedParsing++;
      continue;
    }

    const xyz = xyYtoXYZ_D65(x, y, Y_val);
    if (!xyz) {
      skippedParsing++;
      continue;
    }

    // Keep only the same in-gamut chip set as before (gated on sRGB).
    const rgb = xyzD65toSRGB(xyz);
    if (!rgb) {
      skippedOutOfGamut++;
      continue;
    }

    // Lab comes straight from XYZ(D65) — full precision, not from the 8-bit RGB.
    const lab = xyzD65toLab(xyz);

    const munsell = formatMunsell(hue, value, chroma);
    entries.push({
      munsell,
      r: rgb.r,
      g: rgb.g,
      b: rgb.b,
      lab: { L: round3(lab.L), a: round3(lab.a), b: round3(lab.b) },
    });
  }

  // Generate TypeScript file
  let ts = `/**
 * Auto-generated from the official RIT Munsell Renotation Dataset (real.dat)
 * Source: http://www.rit-mcsl.org/MunsellRenotation/real.dat
 *
 * Generated on: ${new Date().toISOString().split("T")[0]}
 * Total entries: ${entries.length}
 * Skipped (out of sRGB gamut): ${skippedOutOfGamut}
 * Skipped (parse errors): ${skippedParsing}
 *
 * Conversion: CIE xyY (illuminant C) -> XYZ -> Bradford adaptation to D65.
 *   - r,g,b: sRGB (0-255) for display, gated on the sRGB gamut.
 *   - lab:   CIE-Lab (D65) computed directly from XYZ for precise matching.
 * DO NOT EDIT MANUALLY. Re-run: node scripts/generateMunsellData.js
 */

export interface MunsellEntry {
  munsell: string;
  r: number;
  g: number;
  b: number;
  lab: { L: number; a: number; b: number };
}

export const MUNSELL_DATA: MunsellEntry[] = [\n`;

  for (const entry of entries) {
    const { L, a, b } = entry.lab;
    ts += `  { munsell: "${entry.munsell}", r: ${entry.r}, g: ${entry.g}, b: ${entry.b}, lab: { L: ${L}, a: ${a}, b: ${b} } },\n`;
  }

  ts += `];\n`;

  fs.writeFileSync(outputPath, ts, "utf-8");

  console.log(`Generated ${outputPath}`);
  console.log(`  Total entries: ${entries.length}`);
  console.log(`  Skipped (out of sRGB gamut): ${skippedOutOfGamut}`);
  console.log(`  Skipped (parse errors): ${skippedParsing}`);
}

main();
