/**
 * Digitized lookup table from Renger et al. (1987).
 *
 * Reading procedure (as per diagram):
 *   1. Start at Munsell Value on the appropriate Chroma column (left scale)
 *   2. Move right horizontally to the vertical line for your clay %
 *   3. Move vertically to the pH isoline matching your pH (CaCl₂)
 *   4. Move right horizontally to read Humusgehalt % on the right axis
 *
 * ⚠️  TABLE VALUES ARE APPROXIMATE — read from a small image.
 *     Verify each entry against the original printed diagram.
 *     Axes: Value 1–7 (index 0–6) × pH 3–7 (index 0–4) × clay% grid (index 0–6)
 */

// ─── Grid axes ────────────────────────────────────────────────────────────────

export const CLAY_GRID  = [2,  5,  8,  17, 25, 45, 65] as const;
export const PH_GRID    = [3,  4,  5,  6,  7 ] as const;
export const VALUE_GRID = [1,  2,  3,  4,  5,  6,  7 ] as const;

// ─── Lookup tables ────────────────────────────────────────────────────────────
// Structure: [valueIdx 0–6][phIdx 0–4][clayIdx 0–6]
// valueIdx 0 = Munsell Value 1 (darkest), 6 = Value 7 (lightest)
// phIdx    0 = pH 3,  4 = pH 7
// clayIdx  0 = 2% clay, 6 = 65% clay

type HumusTable = number[][][];

// Chroma > 6
const HIGH: HumusTable = [
  // Value 1 (darkest)
  [
    [20, 18, 15, 12, 10,  7,  5], // pH 3
    [14, 12, 10,  8,  7,  5,  4], // pH 4
    [ 9,  8,  7,  5,  4,  3,  2], // pH 5
    [ 5,  5,  4,  3,  3,  2,  1.5], // pH 6
    [ 3,  3,  2.5, 2, 2, 1.5, 1], // pH 7
  ],
  // Value 2
  [
    [14, 12, 10,  8,  7,  5,  4],
    [ 9,  8,  7,  5,  4,  3,  2],
    [ 5,  5,  4,  3,  2.5, 2, 1.5],
    [ 3,  2.5, 2, 1.5, 1.5, 1.2, 1],
    [ 2,  1.8, 1.5, 1.2, 1, 0.8, 0.7],
  ],
  // Value 3
  [
    [ 9,  8,  7,  5,  4,  3,  2.5],
    [ 5,  5,  4,  3,  2.5, 2, 1.5],
    [ 3,  2.5, 2, 1.8, 1.5, 1.2, 1],
    [ 2,  1.8, 1.5, 1.2, 1, 0.8, 0.7],
    [ 1.5, 1.3, 1.2, 1, 0.8, 0.7, 0.6],
  ],
  // Value 4
  [
    [ 5,  5,  4,  3,  2.5, 2, 1.5],
    [ 3,  2.5, 2, 1.8, 1.5, 1.2, 1],
    [ 2,  1.8, 1.5, 1.2, 1, 0.8, 0.7],
    [ 1.3, 1.2, 1, 0.8, 0.7, 0.6, 0.5],
    [ 1,  0.9, 0.8, 0.7, 0.6, 0.5, 0.5],
  ],
  // Value 5
  [
    [ 3,  2.5, 2, 1.8, 1.5, 1.2, 1],
    [ 2,  1.8, 1.5, 1.2, 1, 0.8, 0.7],
    [ 1.3, 1.2, 1, 0.8, 0.7, 0.6, 0.5],
    [ 0.9, 0.8, 0.7, 0.6, 0.5, 0.5, 0.5],
    [ 0.7, 0.6, 0.6, 0.5, 0.5, 0.5, 0.5],
  ],
  // Value 6
  [
    [ 2,  1.8, 1.5, 1.2, 1, 0.8, 0.7],
    [ 1.3, 1.2, 1, 0.8, 0.7, 0.6, 0.5],
    [ 0.9, 0.8, 0.7, 0.6, 0.5, 0.5, 0.5],
    [ 0.7, 0.6, 0.6, 0.5, 0.5, 0.5, 0.5],
    [ 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  ],
  // Value 7 (lightest)
  [
    [ 1.3, 1.2, 1, 0.8, 0.7, 0.6, 0.5],
    [ 0.9, 0.8, 0.7, 0.6, 0.5, 0.5, 0.5],
    [ 0.7, 0.6, 0.6, 0.5, 0.5, 0.5, 0.5],
    [ 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    [ 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  ],
];

// Chroma 3.5–6
const MID: HumusTable = [
  // Value 1
  [
    [20, 20, 18, 15, 13, 10,  8],
    [18, 16, 14, 11,  9,  7,  5],
    [12, 11,  9,  7,  6,  4,  3],
    [ 7,  7,  6,  4,  4,  3,  2],
    [ 5,  4,  3.5, 3, 2.5, 2, 1.5],
  ],
  // Value 2
  [
    [18, 16, 14, 11,  9,  7,  5],
    [12, 11,  9,  7,  6,  4,  3],
    [ 7,  7,  6,  4,  3.5, 3,  2],
    [ 4,  4,  3,  2.5, 2, 1.5, 1.2],
    [ 3,  2.5, 2, 1.8, 1.5, 1.2, 1],
  ],
  // Value 3
  [
    [12, 11,  9,  7,  6,  4,  3],
    [ 7,  7,  6,  4,  3.5, 3,  2],
    [ 4,  4,  3,  2.5, 2, 1.5, 1.2],
    [ 2.5, 2.5, 2, 1.5, 1.3, 1, 0.8],
    [ 2,  1.8, 1.5, 1.2, 1, 0.8, 0.7],
  ],
  // Value 4
  [
    [ 7,  7,  6,  4,  3.5, 3,  2],
    [ 4,  4,  3,  2.5, 2, 1.5, 1.2],
    [ 2.5, 2.5, 2, 1.5, 1.3, 1, 0.8],
    [ 1.5, 1.5, 1.3, 1, 0.9, 0.7, 0.6],
    [ 1.2, 1.1, 1, 0.8, 0.7, 0.6, 0.5],
  ],
  // Value 5
  [
    [ 4,  4,  3,  2.5, 2, 1.5, 1.2],
    [ 2.5, 2.5, 2, 1.5, 1.3, 1, 0.8],
    [ 1.5, 1.5, 1.3, 1, 0.9, 0.7, 0.6],
    [ 1.1, 1, 0.9, 0.7, 0.6, 0.5, 0.5],
    [ 0.8, 0.7, 0.7, 0.6, 0.5, 0.5, 0.5],
  ],
  // Value 6
  [
    [ 2.5, 2.5, 2, 1.5, 1.3, 1, 0.8],
    [ 1.5, 1.5, 1.3, 1, 0.9, 0.7, 0.6],
    [ 1.1, 1, 0.9, 0.7, 0.6, 0.5, 0.5],
    [ 0.8, 0.7, 0.7, 0.6, 0.5, 0.5, 0.5],
    [ 0.6, 0.6, 0.5, 0.5, 0.5, 0.5, 0.5],
  ],
  // Value 7
  [
    [ 1.5, 1.5, 1.3, 1, 0.9, 0.7, 0.6],
    [ 1.1, 1, 0.9, 0.7, 0.6, 0.5, 0.5],
    [ 0.8, 0.7, 0.7, 0.6, 0.5, 0.5, 0.5],
    [ 0.6, 0.6, 0.5, 0.5, 0.5, 0.5, 0.5],
    [ 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  ],
];

// Chroma < 3.5
const LOW: HumusTable = [
  // Value 1
  [
    [20, 20, 20, 20, 18, 15, 12],
    [20, 20, 18, 15, 13, 10,  8],
    [15, 14, 12, 10,  8,  6,  5],
    [10,  9,  8,  6,  5,  4,  3],
    [ 7,  6,  5,  4,  3.5, 3,  2],
  ],
  // Value 2
  [
    [20, 20, 18, 15, 13, 10,  8],
    [15, 14, 12, 10,  8,  6,  5],
    [10,  9,  8,  6,  5,  4,  3],
    [ 6,  5.5, 5, 4, 3.5, 2.5, 2],
    [ 4,  3.5, 3, 2.5, 2, 1.5, 1.2],
  ],
  // Value 3
  [
    [15, 14, 12, 10,  8,  6,  5],
    [10,  9,  8,  6,  5,  4,  3],
    [ 6,  5.5, 5, 4, 3.5, 2.5, 2],
    [ 3.5, 3.5, 3, 2.5, 2, 1.5, 1.2],
    [ 2.5, 2.5, 2, 1.8, 1.5, 1.2, 1],
  ],
  // Value 4
  [
    [10,  9,  8,  6,  5,  4,  3],
    [ 6,  5.5, 5, 4, 3.5, 2.5, 2],
    [ 3.5, 3.5, 3, 2.5, 2, 1.5, 1.2],
    [ 2.2, 2, 1.8, 1.5, 1.2, 1, 0.8],
    [ 1.5, 1.5, 1.3, 1, 0.9, 0.7, 0.6],
  ],
  // Value 5
  [
    [ 6,  5.5, 5, 4, 3.5, 2.5, 2],
    [ 3.5, 3.5, 3, 2.5, 2, 1.5, 1.2],
    [ 2.2, 2, 1.8, 1.5, 1.2, 1, 0.8],
    [ 1.3, 1.3, 1.2, 1, 0.8, 0.7, 0.6],
    [ 1,  0.9, 0.8, 0.7, 0.6, 0.5, 0.5],
  ],
  // Value 6
  [
    [ 3.5, 3.5, 3, 2.5, 2, 1.5, 1.2],
    [ 2.2, 2, 1.8, 1.5, 1.2, 1, 0.8],
    [ 1.3, 1.3, 1.2, 1, 0.8, 0.7, 0.6],
    [ 1,  0.9, 0.8, 0.7, 0.6, 0.5, 0.5],
    [ 0.7, 0.7, 0.6, 0.6, 0.5, 0.5, 0.5],
  ],
  // Value 7
  [
    [ 2.2, 2, 1.8, 1.5, 1.2, 1, 0.8],
    [ 1.3, 1.3, 1.2, 1, 0.8, 0.7, 0.6],
    [ 1,  0.9, 0.8, 0.7, 0.6, 0.5, 0.5],
    [ 0.7, 0.7, 0.6, 0.6, 0.5, 0.5, 0.5],
    [ 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
  ],
];

const TABLES: Record<'high' | 'mid' | 'low', HumusTable> = { high: HIGH, mid: MID, low: LOW };

// ─── Interpolation ────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function interpolateAxis(grid: readonly number[], value: number): { lo: number; hi: number; t: number } {
  const clamped = Math.max(grid[0], Math.min(grid[grid.length - 1], value));
  let lo = 0;
  for (let i = 0; i < grid.length - 1; i++) {
    if (clamped <= grid[i + 1]) { lo = i; break; }
    lo = i;
  }
  const hi = Math.min(lo + 1, grid.length - 1);
  const t = grid[lo] === grid[hi] ? 0 : (clamped - grid[lo]) / (grid[hi] - grid[lo]);
  return { lo, hi, t };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type ChromaClass = 'high' | 'mid' | 'low';

export function chromaToClass(chroma: number): ChromaClass {
  if (chroma > 6) return 'high';
  if (chroma >= 3.5) return 'mid';
  return 'low';
}

/**
 * Estimates Humusgehalt (%) from Munsell Value (moist), Chroma class, pH (CaCl₂), and clay %.
 * Uses trilinear interpolation between grid points.
 */
export function estimateHumus(
  value: number,
  chromaClass: ChromaClass,
  pH: number,
  clay: number,
): number {
  const table = TABLES[chromaClass];

  // Value axis: grid is 1–7, index 0–6
  const vGrid = VALUE_GRID as unknown as readonly number[];
  const { lo: vLo, hi: vHi, t: vT } = interpolateAxis(vGrid, value);

  const { lo: pLo, hi: pHi, t: pT } = interpolateAxis(PH_GRID as unknown as readonly number[], pH);
  const { lo: cLo, hi: cHi, t: cT } = interpolateAxis(CLAY_GRID as unknown as readonly number[], clay);

  // Trilinear interpolation: value × pH × clay
  function sample(vi: number, pi: number, ci: number) {
    return table[vi]?.[pi]?.[ci] ?? 0.5;
  }

  const v0 = lerp(
    lerp(lerp(sample(vLo, pLo, cLo), sample(vLo, pLo, cHi), cT),
         lerp(sample(vLo, pHi, cLo), sample(vLo, pHi, cHi), cT), pT),
    lerp(lerp(sample(vHi, pLo, cLo), sample(vHi, pLo, cHi), cT),
         lerp(sample(vHi, pHi, cLo), sample(vHi, pHi, cHi), cT), pT),
    vT,
  );

  return Math.round(v0 * 10) / 10;
}

// ─── Bodenart → clay % ───────────────────────────────────────────────────────

const BODENART_CLAY: Record<string, number> = {
  S: 3,
  Su: 4, U: 4, Sl: 4, Slu: 4,
  Us: 6, Ut: 6,
  St: 12,
  Ls: 20, Lu: 20,
  Ts: 35, Lts: 35, Lt: 35,
  Tl: 55, Tu: 55,
  T: 72,
};

/** Strips trailing digits (e.g. "Su2" → "Su") then looks up clay %. Returns null if unknown. */
export function bodenartToClay(bodenart: string): number | null {
  const key = bodenart.trim().replace(/\d+$/, '');
  return BODENART_CLAY[key] ?? null;
}

// ─── Munsell parser ───────────────────────────────────────────────────────────

/** Parses "10YR 4/3" → { value: 4, chroma: 3 }. Returns null if unparseable. */
export function parseMunsell(s: string): { value: number; chroma: number } | null {
  const m = s.match(/([\d.]+)\s*\/\s*([\d.]+)/);
  if (!m) return null;
  return { value: parseFloat(m[1]), chroma: parseFloat(m[2]) };
}

// ─── Humus class ─────────────────────────────────────────────────────────────

export type HumusKlasse = { klasse: string; label: string };

export function humusKlasse(humus: number): HumusKlasse {
  if (humus < 1)   return { klasse: 'h1', label: 'sehr schwach humos' };
  if (humus < 2)   return { klasse: 'h2', label: 'schwach humos' };
  if (humus < 5)   return { klasse: 'h3', label: 'humos' };
  if (humus < 10)  return { klasse: 'h4', label: 'stark humos' };
  if (humus < 15)  return { klasse: 'h5', label: 'sehr stark humos' };
  return             { klasse: 'h6', label: 'extrem humos (anmoorig)' };
}
