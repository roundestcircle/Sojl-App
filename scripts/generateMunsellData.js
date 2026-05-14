/**
 * Generates munsellData.ts from the official RIT Munsell Renotation Dataset.
 *
 * Download real.dat from:
 *   http://www.rit-mcsl.org/MunsellRenotation/real.dat
 *
 * Place it in the project root, then run:
 *   node scripts/generateMunsellData.js
 */

const fs = require("fs");
const path = require("path");

// --- Color math utilities ---

// Bradford chromatic adaptation matrix (illuminant C -> D65)
// Illuminant C white point: x=0.3101, y=0.3162 -> X=0.98074, Y=1.0, Z=1.18232
// Illuminant D65 white point: x=0.3127, y=0.3290 -> X=0.95047, Y=1.0, Z=1.08883

const BRADFORD_M = [
  [0.8951, 0.2664, -0.1614],
  [-0.7502, 1.7135, 0.0367],
  [0.0389, -0.0685, 1.0296],
];

const BRADFORD_M_INV = [
  [0.987, -0.1471, 0.16],
  [0.4323, 0.5184, 0.0493],
  [-0.0085, 0.04, 0.9685],
];

function matMul3(M, v) {
  return [
    M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
    M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
    M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2],
  ];
}

// Precompute the full adaptation matrix from illuminant C to D65
function computeAdaptationMatrix() {
  const srcWhite = [0.98074, 1.0, 1.18232]; // Illuminant C
  const dstWhite = [0.95047, 1.0, 1.08883]; // D65

  const srcCone = matMul3(BRADFORD_M, srcWhite);
  const dstCone = matMul3(BRADFORD_M, dstWhite);

  // Diagonal scaling matrix
  const scale = [
    [dstCone[0] / srcCone[0], 0, 0],
    [0, dstCone[1] / srcCone[1], 0],
    [0, 0, dstCone[2] / srcCone[2]],
  ];

  // Full adaptation = M_inv * scale * M
  const scaleTimesM = [];
  for (let i = 0; i < 3; i++) {
    scaleTimesM[i] = [];
    for (let j = 0; j < 3; j++) {
      scaleTimesM[i][j] =
        scale[i][0] * BRADFORD_M[0][j] +
        scale[i][1] * BRADFORD_M[1][j] +
        scale[i][2] * BRADFORD_M[2][j];
    }
  }

  const adapt = [];
  for (let i = 0; i < 3; i++) {
    adapt[i] = [];
    for (let j = 0; j < 3; j++) {
      adapt[i][j] =
        BRADFORD_M_INV[i][0] * scaleTimesM[0][j] +
        BRADFORD_M_INV[i][1] * scaleTimesM[1][j] +
        BRADFORD_M_INV[i][2] * scaleTimesM[2][j];
    }
  }

  return adapt;
}

const ADAPT_C_TO_D65 = computeAdaptationMatrix();

/**
 * Convert CIE xyY (illuminant C) to sRGB (0-255)
 * Returns null if the color is outside the sRGB gamut.
 */
function xyYtoSRGB(x, y, Y_val) {
  if (y === 0) return null;

  // xyY -> XYZ (normalized so Y is in 0..~100 range from the dataset)
  // The renotation data Y is already in the 0-100 scale
  const Y_norm = Y_val / 100;
  const X = (x * Y_norm) / y;
  const Z = ((1 - x - y) * Y_norm) / y;

  // Chromatic adaptation: illuminant C -> D65
  const [Xd, Yd, Zd] = matMul3(ADAPT_C_TO_D65, [X, Y_norm, Z]);

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
 * Parse a Munsell hue string like "2.5YR", "10R", "5GY" etc.
 * into a canonical form.
 */
function parseHue(hueStr) {
  return hueStr.trim();
}

/**
 * Format Munsell notation: "HUE VALUE/CHROMA"
 */
function formatMunsell(hue, value, chroma) {
  // Format value as integer if whole number
  const vStr = value % 1 === 0 ? value.toString() : value.toFixed(1);
  const cStr = chroma % 1 === 0 ? chroma.toString() : chroma.toFixed(1);
  return `${hue} ${vStr}/${cStr}`;
}

// --- Main ---

function main() {
  const inputPath = path.join(__dirname, "..", "real.dat");
  const outputPath = path.join(__dirname, "..", "utils", "munsellData.ts");

  if (!fs.existsSync(inputPath)) {
    console.error("Error: real.dat not found in project root.");
    console.error(
      "Download it from: http://www.rit-mcsl.org/MunsellRenotation/real.dat",
    );
    console.error("Place it in: " + path.join(__dirname, ".."));
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf-8");
  const lines = raw.split("\n");

  const entries = [];
  let skippedOutOfGamut = 0;
  let skippedParsing = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("H")) continue; // Skip header/empty

    // Format: hue value chroma x y Y
    // Fields are whitespace-separated, but hue can be like "2.5YR" or "N"
    // The hue includes letters, so we need to handle that
    const parts = trimmed.split(/\s+/);
    if (parts.length < 6) {
      skippedParsing++;
      continue;
    }

    // The hue might be split across first two columns if it has a number prefix
    // e.g., "2.5" "YR" "3" "4" "0.123" "0.456" "7.89"
    // or "N" "5" "0" "0.310" "0.316" "19.77"
    let hue, value, chroma, x, y, Y_val;

    // Try to detect if first part is purely numeric (hue number prefix)
    if (/^[\d.]+$/.test(parts[0]) && parts.length >= 7) {
      // Hue is split: "2.5" + "YR"
      hue = parts[0] + parts[1];
      value = parseFloat(parts[2]);
      chroma = parseFloat(parts[3]);
      x = parseFloat(parts[4]);
      y = parseFloat(parts[5]);
      Y_val = parseFloat(parts[6]);
    } else {
      // Hue is single token: "N" or already combined
      hue = parts[0];
      value = parseFloat(parts[1]);
      chroma = parseFloat(parts[2]);
      x = parseFloat(parts[3]);
      y = parseFloat(parts[4]);
      Y_val = parseFloat(parts[5]);
    }

    if (isNaN(value) || isNaN(chroma) || isNaN(x) || isNaN(y) || isNaN(Y_val)) {
      skippedParsing++;
      continue;
    }

    const rgb = xyYtoSRGB(x, y, Y_val);
    if (!rgb) {
      skippedOutOfGamut++;
      continue;
    }

    const munsell = formatMunsell(parseHue(hue), value, chroma);
    entries.push({ munsell, r: rgb.r, g: rgb.g, b: rgb.b });
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
 * Conversion: CIE xyY (illuminant C) -> XYZ -> Bradford adaptation to D65 -> sRGB
 * DO NOT EDIT MANUALLY. Re-run: node scripts/generateMunsellData.js
 */

export interface MunsellEntry {
  munsell: string;
  r: number;
  g: number;
  b: number;
}

export const MUNSELL_DATA: MunsellEntry[] = [\n`;

  for (const entry of entries) {
    ts += `  { munsell: '${entry.munsell}', r: ${entry.r}, g: ${entry.g}, b: ${entry.b} },\n`;
  }

  ts += `];\n`;

  fs.writeFileSync(outputPath, ts, "utf-8");

  console.log(`Generated ${outputPath}`);
  console.log(`  Total entries: ${entries.length}`);
  console.log(`  Skipped (out of sRGB gamut): ${skippedOutOfGamut}`);
  console.log(`  Skipped (parse errors): ${skippedParsing}`);
}

main();
