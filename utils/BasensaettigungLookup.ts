// Each entry: [base_saturation_pct, pH], sorted by pH ascending.
// Source: digitized curves from soil science literature, three humus groups.

type CurvePoint = [number, number];

const CURVE_LT4: CurvePoint[] = [
  [1.754, 2.526],
  [5, 2.866],
  [10, 3.158],
  [15, 3.367],
  [20, 3.480],
  [25, 3.616],
  [30, 3.734],
  [35, 3.852],
  [40, 3.980],
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
  [20, 3.770],
  [25, 3.923],
  [30, 4.081],
  [35, 4.121],
  [40, 4.288],
  [45, 4.510],
  [50, 4.614],
  [55, 4.739],
  [60, 4.903],
  [75, 5.546],
  [80, 5.720],
  [85, 5.981],
  [90, 6.348],
  [95, 6.811],
  [100, 7.65],
];

const CURVE_GT15: CurvePoint[] = [
  [0, 2.410],
  [5, 3.277],
  [10, 3.586],
  [15, 3.823],
  [20, 4.084],
  [25, 4.292],
  [30, 4.468],
  [35, 4.539],
  [40, 4.762],
  [45, 4.953],
  [50, 5.100],
  [55, 5.278],
  [60, 5.483],
  [65, 5.671],
  [70, 5.874],
  [75, 6.010],
  [80, 6.174],
  [85, 6.320],
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
 * Estimates Basensättigung (%) from pH (CaCl₂) and humus percentage.
 * Humus groups: ≤4% → curve 1, 4–15% exclusive → curve 2, ≥15% → curve 3.
 * Returns empty string if pH is missing.
 */
export function calcBasensaettigung(pHStr: string, humusPctStr: string): string {
  const pH = parseFloat(pHStr);
  if (isNaN(pH)) return "";
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
