export type ClayRange = { min: number; max: number };

const BODENART_CLAY: Record<string, ClayRange> = {
  Ss:  { min:  0, max:  5 },
  Su2: { min:  0, max:  5 },
  Sl2: { min:  5, max:  8 },
  Sl3: { min:  8, max: 12 },
  St2: { min:  5, max: 17 },
  Su3: { min:  0, max:  8 },
  Su4: { min:  0, max:  8 },
  Slu: { min:  8, max: 17 },
  Sl4: { min: 12, max: 17 },
  St3: { min: 17, max: 25 },
  Ls2: { min: 17, max: 25 },
  Ls3: { min: 17, max: 25 },
  Ls4: { min: 17, max: 25 },
  Lt2: { min: 25, max: 35 },
  Lts: { min: 25, max: 45 },
  Ts4: { min: 25, max: 35 },
  Ts3: { min: 35, max: 45 },
  Uu:  { min:  0, max:  8 },
  Us:  { min:  0, max:  8 },
  Ut2: { min:  8, max: 12 },
  Ut3: { min: 12, max: 17 },
  Uls: { min:  8, max: 17 },
  Ut4: { min: 17, max: 25 },
  Lu:  { min: 17, max: 30 },
  Lt3: { min: 35, max: 45 },
  Tu3: { min: 30, max: 45 },
  Tu4: { min: 25, max: 35 },
  Ts2: { min: 45, max: 65 },
  Tl:  { min: 45, max: 65 },
  Tu2: { min: 45, max: 65 },
  Tt:  { min: 65, max: 100 },
};

/** Tries exact match, then strips trailing digits (e.g. "Su2" → "Su") as fallback. */
export function bodenartToClay(bodenart: string): ClayRange | null {
  const trimmed = bodenart.trim();
  return (
    BODENART_CLAY[trimmed] ??
    BODENART_CLAY[trimmed.replace(/\d+$/, "")] ??
    null
  );
}

/** Returns the midpoint of the clay range, rounded to the nearest integer. */
export function bodenartToClayMidpoint(bodenart: string): number | null {
  const range = bodenartToClay(bodenart);
  if (range === null) return null;
  return Math.round((range.min + range.max) / 2);
}
