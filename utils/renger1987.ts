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

// Reduced grids
export const CLAY_GRID  = [2,  8, 25, 65] as const;
export const PH_GRID    = [3,  5,  7] as const;
export const VALUE_GRID = [1,  3,  5,  7] as const;

// Type: [valueIdx][pHIdx][clayIdx]
type HumusTable = number[][][];

// ─── HIGH chroma (>6) ───────────────────────────────────────────────────────
// All values are NaN – replace with numbers read from your diagram.
// Order: valueIdx 0 = Value 1, 1 = Value 3, 2 = Value 5, 3 = Value 7
//        pHIdx   0 = pH 3,    1 = pH 5,    2 = pH 7
//        clayIdx 0 = 2% clay, 1 = 8% clay, 2 = 25% clay, 3 = 65% clay

const HIGH: HumusTable = [
  // Value 1
  [
    [NaN, NaN, NaN, NaN], // pH 3
    [NaN, NaN, NaN, NaN], // pH 5
    [NaN, NaN, NaN, NaN], // pH 7
  ],
  // Value 3
  [
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
  ],
  // Value 5
  [
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
  ],
  // Value 7
  [
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
  ],
];

// ─── MID chroma (3.5 – 6) ────────────────────────────────────────────────────
const MID: HumusTable = [
  // Value 1
  [
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
  ],
  // Value 3
  [
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
  ],
  // Value 5
  [
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
  ],
  // Value 7
  [
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
  ],
];

// ─── LOW chroma (<3.5) ──────────────────────────────────────────────────────
const LOW: HumusTable = [
  // Value 1
  [
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
  ],
  // Value 3
  [
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
  ],
  // Value 5
  [
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
  ],
  // Value 7
  [
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
    [NaN, NaN, NaN, NaN],
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
