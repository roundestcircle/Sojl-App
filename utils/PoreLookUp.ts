// Type definition for a single soil entry
interface SoilHydraulics {
  bulkDensityClass: string; // e.g. "<1.45", "1.45-1.65", ">1.65", for clay also "<1.2", "1.2-1.45"
  totalPorosity: number; // Vol%
  airCapacity: number;
  fieldCapacity: number;
  availableWater: number;
}

// Full lookup table
export const soilLookup: Record<string, SoilHydraulics[]> = {
  // Sande (Sands)
  Ss: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 50,
      airCapacity: 36,
      fieldCapacity: 14,
      availableWater: 9,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 43,
      airCapacity: 32,
      fieldCapacity: 11,
      availableWater: 7,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 37,
      airCapacity: 27,
      fieldCapacity: 10,
      availableWater: 7,
    },
  ],
  Sl: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 52,
      airCapacity: 20,
      fieldCapacity: 33,
      availableWater: 21,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 42,
      airCapacity: 15,
      fieldCapacity: 27,
      availableWater: 18,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 35,
      airCapacity: 10,
      fieldCapacity: 25,
      availableWater: 16,
    },
  ],
  Su: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 52,
      airCapacity: 18,
      fieldCapacity: 33,
      availableWater: 24,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 43,
      airCapacity: 15,
      fieldCapacity: 28,
      availableWater: 21,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 36,
      airCapacity: 11,
      fieldCapacity: 25,
      availableWater: 19,
    },
  ],
  Slu: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 52,
      airCapacity: 14,
      fieldCapacity: 38,
      availableWater: 23,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 43,
      airCapacity: 10,
      fieldCapacity: 33,
      availableWater: 21,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 37,
      airCapacity: 7,
      fieldCapacity: 30,
      availableWater: 19,
    },
  ],
  St: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 52,
      airCapacity: 21,
      fieldCapacity: 31,
      availableWater: 18,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 43,
      airCapacity: 17,
      fieldCapacity: 26,
      availableWater: 16,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 34,
      airCapacity: 12,
      fieldCapacity: 22,
      availableWater: 13,
    },
  ],

  // Schluffe (Silts)
  Uu: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 53,
      airCapacity: 10,
      fieldCapacity: 43,
      availableWater: 30,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 45,
      airCapacity: 7,
      fieldCapacity: 38,
      availableWater: 26,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 38,
      airCapacity: 3,
      fieldCapacity: 35,
      availableWater: 23,
    },
  ],
  Us: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 52,
      airCapacity: 11,
      fieldCapacity: 41,
      availableWater: 28,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 44,
      airCapacity: 9,
      fieldCapacity: 35,
      availableWater: 25,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 36,
      airCapacity: 4,
      fieldCapacity: 32,
      availableWater: 22,
    },
  ],
  Ul: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 52,
      airCapacity: 13,
      fieldCapacity: 39,
      availableWater: 24,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 43,
      airCapacity: 8,
      fieldCapacity: 35,
      availableWater: 22,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 38,
      airCapacity: 5,
      fieldCapacity: 33,
      availableWater: 21,
    },
  ],
  Ut: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 50,
      airCapacity: 11,
      fieldCapacity: 39,
      availableWater: 26,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 43,
      airCapacity: 6,
      fieldCapacity: 37,
      availableWater: 24,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 38,
      airCapacity: 3,
      fieldCapacity: 35,
      availableWater: 22,
    },
  ],

  // Lehme (Loams)
  Ls: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 54,
      airCapacity: 14,
      fieldCapacity: 39,
      availableWater: 21,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 43,
      airCapacity: 10,
      fieldCapacity: 33,
      availableWater: 16,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 36,
      airCapacity: 6,
      fieldCapacity: 30,
      availableWater: 14,
    },
  ],
  Lt: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 53,
      airCapacity: 10,
      fieldCapacity: 44,
      availableWater: 18,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 44,
      airCapacity: 6,
      fieldCapacity: 38,
      availableWater: 13,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 38,
      airCapacity: 4,
      fieldCapacity: 34,
      availableWater: 11,
    },
  ],
  Lts: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 54,
      airCapacity: 10,
      fieldCapacity: 44,
      availableWater: 17,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 43,
      airCapacity: 6,
      fieldCapacity: 37,
      availableWater: 14,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 36,
      airCapacity: 5,
      fieldCapacity: 31,
      availableWater: 11,
    },
  ],
  Lu: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 53,
      airCapacity: 12,
      fieldCapacity: 41,
      availableWater: 21,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 43,
      airCapacity: 7,
      fieldCapacity: 36,
      availableWater: 17,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 37,
      airCapacity: 4,
      fieldCapacity: 33,
      availableWater: 15,
    },
  ],

  // Tone (Clays) – correct density classes: <1.2, 1.2-1.45, 1.45-1.65, >1.65
  // Air capacities for >1.65 provided by user
  Tt: [
    {
      bulkDensityClass: "<1.2",
      totalPorosity: 64,
      airCapacity: 8,
      fieldCapacity: 56,
      availableWater: 20,
    },
    {
      bulkDensityClass: "1.2-1.45",
      totalPorosity: 52,
      airCapacity: 4,
      fieldCapacity: 48,
      availableWater: 15,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 46,
      airCapacity: 3,
      fieldCapacity: 43,
      availableWater: 13,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 37,
      airCapacity: 2,
      fieldCapacity: 35,
      availableWater: 12,
    },
  ],
  Tl: [
    {
      bulkDensityClass: "<1.2",
      totalPorosity: 63,
      airCapacity: 9,
      fieldCapacity: 53,
      availableWater: 19,
    },
    {
      bulkDensityClass: "1.2-1.45",
      totalPorosity: 52,
      airCapacity: 5,
      fieldCapacity: 47,
      availableWater: 14,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 45,
      airCapacity: 4,
      fieldCapacity: 41,
      availableWater: 13,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 38,
      airCapacity: 3,
      fieldCapacity: 35,
      availableWater: 11,
    },
  ],
  Tu2: [
    {
      bulkDensityClass: "<1.2",
      totalPorosity: 60,
      airCapacity: 7,
      fieldCapacity: 53,
      availableWater: 20,
    },
    {
      bulkDensityClass: "1.2-1.45",
      totalPorosity: 51,
      airCapacity: 5,
      fieldCapacity: 46,
      availableWater: 15,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 46,
      airCapacity: 4,
      fieldCapacity: 42,
      availableWater: 12,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 39,
      airCapacity: 3,
      fieldCapacity: 36,
      availableWater: 10,
    },
  ],
  Tu3_4: [
    {
      bulkDensityClass: "<1.2",
      totalPorosity: 60,
      airCapacity: 11,
      fieldCapacity: 49,
      availableWater: 22,
    },
    {
      bulkDensityClass: "1.2-1.45",
      totalPorosity: 50,
      airCapacity: 9,
      fieldCapacity: 41,
      availableWater: 17,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 44,
      airCapacity: 6,
      fieldCapacity: 38,
      availableWater: 15,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 38,
      airCapacity: 3,
      fieldCapacity: 35,
      availableWater: 13,
    },
  ],
  Ts2: [
    {
      bulkDensityClass: "<1.2",
      totalPorosity: 61,
      airCapacity: 10,
      fieldCapacity: 51,
      availableWater: 18,
    },
    {
      bulkDensityClass: "1.2-1.45",
      totalPorosity: 51,
      airCapacity: 5,
      fieldCapacity: 46,
      availableWater: 15,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 43,
      airCapacity: 4,
      fieldCapacity: 39,
      availableWater: 13,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 37,
      airCapacity: 3,
      fieldCapacity: 34,
      availableWater: 12,
    },
  ],
  Ts3_4: [
    {
      bulkDensityClass: "<1.2",
      totalPorosity: 59,
      airCapacity: 13,
      fieldCapacity: 46,
      availableWater: 17,
    },
    {
      bulkDensityClass: "1.2-1.45",
      totalPorosity: 54,
      airCapacity: 10,
      fieldCapacity: 44,
      availableWater: 17,
    },
    {
      bulkDensityClass: "1.45-1.65",
      totalPorosity: 43,
      airCapacity: 8,
      fieldCapacity: 35,
      availableWater: 14,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 37,
      airCapacity: 6,
      fieldCapacity: 31,
      availableWater: 11,
    },
  ],

  // anmoorige Horizonte (Aa) – 15–30% organic matter
  // The original table shows two bulk density classes, only <1.45 and >1.65 are given
  anmoorig_sand: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 67,
      airCapacity: 11,
      fieldCapacity: 56,
      availableWater: NaN,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 73,
      airCapacity: 11,
      fieldCapacity: 57,
      availableWater: NaN,
    },
  ],
  anmoorig_loam_clay: [
    {
      bulkDensityClass: "<1.45",
      totalPorosity: 71,
      airCapacity: 6,
      fieldCapacity: 67,
      availableWater: NaN,
    },
    {
      bulkDensityClass: ">1.65",
      totalPorosity: 66,
      airCapacity: 6,
      fieldCapacity: 67,
      availableWater: NaN,
    },
  ],
};

// Soil group keys (matching the original table)
export type SoilGroup = "Ss" | "S_other" | "U_L_except_Lt" | "Lt_Tone";

// Humus classes (only h2 to h5 appear in the adjustment table)
export type HumusClass = "h2" | "h3" | "h4" | "h5";

// Property types
export type SoilProperty = "total" | "air" | "field" | "available";

// Adjustment values: [soilGroup][property][humusClass] -> delta (%)
export const HUMUS_ADJUSTMENTS: Record<
  SoilGroup,
  Record<SoilProperty, Record<HumusClass, number>>
> = {
  Ss: {
    total: { h2: 3, h3: 5, h4: 7, h5: 9 },
    air: { h2: 0, h3: -1, h4: -2, h5: -3 },
    field: { h2: 3, h3: 6, h4: 9, h5: 12 },
    available: { h2: 1, h3: 3, h4: 4, h5: 5 },
  },
  S_other: {
    total: { h2: 4, h3: 7, h4: 12, h5: 16 },
    air: { h2: 1, h3: 2, h4: 3, h5: 4 },
    field: { h2: 3, h3: 6, h4: 9, h5: 13 },
    available: { h2: 2, h3: 3, h4: 4, h5: 6 },
  },
  U_L_except_Lt: {
    total: { h2: 5, h3: 9, h4: 15, h5: 20 },
    air: { h2: 2, h3: 3, h4: 5, h5: 7 },
    field: { h2: 3, h3: 6, h4: 10, h5: 13 },
    available: { h2: 2, h3: 3, h4: 5, h5: 6 },
  },
  Lt_Tone: {
    total: { h2: 6, h3: 9, h4: 15, h5: 20 },
    air: { h2: 1, h3: 2, h4: 4, h5: 7 },
    field: { h2: 5, h3: 7, h4: 11, h5: 14 },
    available: { h2: 2, h3: 4, h4: 6, h5: 8 },
  },
};

/**
 * Get adjustment delta for a given soil group, property, and humus class.
 */
export function getHumusAdjustment(
  soilGroup: SoilGroup,
  property: SoilProperty,
  humusClass: HumusClass,
): number {
  return HUMUS_ADJUSTMENTS[soilGroup][property][humusClass];
}

const HUMUS_MIDPOINTS: Record<HumusClass, number> = {
  h2: 1.5,
  h3: 3.5,
  h4: 7.5,
  h5: 12.5,
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function getHumusAdjustmentInterpolated(
  soilGroup: SoilGroup,
  property: SoilProperty,
  humusPercent: number,
): number {
  const classes: HumusClass[] = ["h2", "h3", "h4", "h5"];
  let lower: HumusClass | null = null;
  let upper: HumusClass | null = null;

  for (let i = 0; i < classes.length; i++) {
    const mid = HUMUS_MIDPOINTS[classes[i]];
    if (humusPercent <= mid) {
      upper = classes[i];
      lower = i > 0 ? classes[i - 1] : classes[i];
      break;
    }
  }
  if (!upper) {
    lower = classes[classes.length - 1];
    upper = lower;
  }
  if (!lower) lower = upper;

  if (lower === upper) {
    return HUMUS_ADJUSTMENTS[soilGroup][property][lower];
  }

  const lowerMid = HUMUS_MIDPOINTS[lower];
  const upperMid = HUMUS_MIDPOINTS[upper];
  const t = (humusPercent - lowerMid) / (upperMid - lowerMid);
  const lowerVal = HUMUS_ADJUSTMENTS[soilGroup][property][lower];
  const upperVal = HUMUS_ADJUSTMENTS[soilGroup][property][upper];
  return lerp(lowerVal, upperVal, t);
}

/** Maps a KA6 bodenart string (with or without numeric suffix) to a soilLookup key. */
export function bodenartToLookupKey(bodenart: string): string | null {
  const s = bodenart.trim();
  if (s === "Tu2") return "Tu2";
  if (s === "Tu3" || s === "Tu4") return "Tu3_4";
  if (s === "Ts2") return "Ts2";
  if (s === "Ts3" || s === "Ts4") return "Ts3_4";
  const base = s.replace(/\d+$/, "");
  return base in soilLookup ? base : null;
}

const CLAY_KEYS = new Set(["Tt", "Tl", "Tu2", "Tu3_4", "Ts2", "Ts3_4"]);

export function soilGroupFromBodenart(bodenart: string): SoilGroup {
  const key = bodenartToLookupKey(bodenart) ?? bodenart.replace(/\d+$/, "");
  if (key === "Ss") return "Ss";
  if (["Su", "Slu", "Sl", "St"].includes(key)) return "S_other";
  if (CLAY_KEYS.has(key) || key === "Lt") return "Lt_Tone";
  return "U_L_except_Lt";
}

/** Parses a density midpoint (kg/dm³) from a string like "1,2–1,4 kg/dm³" or plain "1.6". */
export function parseDensityMidpoint(lagerungsdichte: string): number | null {
  const s = lagerungsdichte.replace(/,/g, ".").replace(/[–−]/g, "-");
  const rangeMatch = s.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
  if (rangeMatch)
    return (parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2;
  const gtMatch = s.match(/[>≥]\s*(\d+\.?\d*)/);
  if (gtMatch) return parseFloat(gtMatch[1]) + 0.15;
  const ltMatch = s.match(/[<≤]\s*(\d+\.?\d*)/);
  if (ltMatch) return parseFloat(ltMatch[1]) - 0.15;
  const numMatch = s.match(/(\d+\.?\d*)/);
  if (numMatch) return parseFloat(numMatch[1]);
  return null;
}

function getDensityClass(midpoint: number, lookupKey: string): string {
  if (CLAY_KEYS.has(lookupKey)) {
    if (midpoint < 1.2) return "<1.2";
    if (midpoint < 1.45) return "1.2-1.45";
    if (midpoint <= 1.65) return "1.45-1.65";
    return ">1.65";
  }
  if (midpoint < 1.45) return "<1.45";
  if (midpoint <= 1.65) return "1.45-1.65";
  return ">1.65";
}

/** Returns base pore values for a bodenart + lagerungsdichte string, or null if unresolvable. */
export function lookupPoreValues(
  bodenart: string,
  lagerungsdichte: string,
): SoilHydraulics | null {
  const key = bodenartToLookupKey(bodenart);
  if (!key) return null;
  const midpoint = parseDensityMidpoint(lagerungsdichte);
  if (midpoint === null || isNaN(midpoint)) return null;
  const densityClass = getDensityClass(midpoint, key);
  return (
    soilLookup[key]?.find((e) => e.bulkDensityClass === densityClass) ?? null
  );
}
