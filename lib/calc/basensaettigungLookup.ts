// Each entry: [base_saturation_pct, pH], sorted by pH ascending.
// Source: digitized curves from soil science literature, three humus groups.

type CurvePoint = [number, number];

const CURVE_LT4: CurvePoint[] = [
  [1.754, 2.526],
  [5, 2.866],
  [10, 3.158],
  [15, 3.367],
  [20, 3.48],
  [25, 3.616],
  [30, 3.734],
  [35, 3.852],
  [40, 3.98],
  [45, 4.068],
  [50, 4.171],
  [55, 4.303],
  [60, 4.477],
  [65, 4.699],
  [70, 4.959],
  [75, 5.154],
  [80, 5.428],
  [85, 5.705],
  [90, 6.049],
  [95, 6.545],
  [100, 7.65],
];

const CURVE_4TO15: CurvePoint[] = [
  [0, 2.498],
  [5, 3.039],
  [10, 3.418],
  [15, 3.587],
  [20, 3.77],
  [25, 3.923],
  [30, 4.081],
  [35, 4.121],
  [40, 4.288],
  [45, 4.51],
  [50, 4.614],
  [55, 4.739],
  [60, 4.903],
  // Gap intentional: digitized source has no readable points at BS 65 % / 70 %.
  // interpBS linearly interpolates across the 15-pp span between 60 and 75.
  [75, 5.546],
  [80, 5.72],
  [85, 5.981],
  [90, 6.348],
  [95, 6.811],
  [100, 7.65],
];

const CURVE_GT15: CurvePoint[] = [
  [0, 2.41],
  [5, 3.277],
  [10, 3.586],
  [15, 3.823],
  [20, 4.084],
  [25, 4.292],
  [30, 4.468],
  [35, 4.539],
  [40, 4.762],
  [45, 4.953],
  [50, 5.1],
  [55, 5.278],
  [60, 5.483],
  [65, 5.671],
  [70, 5.874],
  [75, 6.01],
  [80, 6.174],
  [85, 6.32],
  [90, 6.589],
  [95, 6.982],
  [100, 7.65],
];

function interpBS(curve: CurvePoint[], pH: number): number {
  if (pH <= curve[0][1]) return curve[0][0];
  if (pH >= curve[curve.length - 1][1]) return 100;
  for (let i = 0; i < curve.length - 1; i++) {
    const [bs0, ph0] = curve[i];
    const [bs1, ph1] = curve[i + 1];
    if (pH >= ph0 && pH <= ph1) {
      return bs0 + ((pH - ph0) / (ph1 - ph0)) * (bs1 - bs0);
    }
  }
  return 100;
}

/**
 * Returns the human-readable humus-group label used to pick the BS curve, or
 * null if humus % isn't parseable. Centralizes the bucket cutoffs so callers
 * and `calcBasensaettigung` can't drift.
 */
export function humusGroupLabel(humusPctStr: string): string | null {
  const n = parseFloat(humusPctStr);
  if (isNaN(n)) return null;
  if (n <= 4) return "≤ 4 % Humus";
  if (n < 15) return "4 – 15 % Humus";
  return "≥ 15 % Humus";
}

/**
 * Estimates Basensättigung (%) from pH (CaCl₂) and humus percentage.
 * Humus groups: ≤4% → curve 1, 4–15% exclusive → curve 2, ≥15% → curve 3.
 * Returns empty string if pH is missing.
 */
export function calcBasensaettigung(
  pHStr: string,
  humusPctStr: string,
): string {
  const pH = parseFloat(pHStr);
  if (isNaN(pH)) return "";
  if (!humusPctStr.trim()) return "";
  const humus = parseFloat(humusPctStr);

  let curve: CurvePoint[];
  if (isNaN(humus) || humus <= 4) {
    curve = CURVE_LT4;
  } else if (humus < 15) {
    curve = CURVE_4TO15;
  } else {
    curve = CURVE_GT15;
  }

  return interpBS(curve, pH).toFixed(1);
}
