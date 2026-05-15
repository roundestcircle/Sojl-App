import {
  lookupPoreValues,
  soilGroupFromBodenart,
  getHumusAdjustmentInterpolated,
  parseDensityMidpoint,
} from "./PoreLookUp";
import type { Horizont } from "./HorizonQueries";

/** Returns Mächtigkeit in dm, or empty string if inputs are invalid. */
export function calcMaechtigkeitDm(
  tiefeOben: string,
  tiefeUnten: string,
): string {
  const von = parseFloat(tiefeOben);
  const bis = parseFloat(tiefeUnten);
  return !isNaN(von) && !isNaN(bis) && bis > von
    ? String(((bis - von) / 10).toFixed(1))
    : "";
}

/** Sums horizon Mächtigkeiten (dm) and returns Gründigkeit in cm, or empty string if no valid values. */
export function calcGrundigkeitCm(maechtigkeiten: string[]): string {
  const total = maechtigkeiten
    .map((v) => parseFloat(v))
    .filter((v) => !isNaN(v))
    .reduce((sum, v) => sum + v, 0);
  return total > 0 ? String(Math.round(total * 10)) : "";
}

// ─── Rating categories ──────────────────────────────────────────────────────
export type Rating =
  | "sehr gering"
  | "gering"
  | "mäßig"
  | "mittel"
  | "hoch"
  | "sehr hoch";

// ─── GPV (Gesamtporenvolumen) in Vol% ───────────────────────────────────────
// Thresholds: <30, 30–40, 40–50, 50–60, >60
export function rateGPV(value: number): Rating {
  if (value < 30) return "sehr gering";
  if (value < 40) return "gering";
  if (value < 50) return "mittel";
  if (value < 60) return "hoch";
  return "sehr hoch";
}

// ─── LK (Luftkapazität) in Vol% ─────────────────────────────────────────────
export function rateLK(value: number): Rating {
  if (value < 2) return "sehr gering";
  if (value < 4) return "gering";
  if (value < 12) return "mittel";
  if (value < 20) return "hoch";
  return "sehr hoch";
}

// ─── FK (Feldkapazität) in Ltr./m²·We ────────────────────────────────────────
// Thresholds: <130, 130–260, 260–390, 390–520, >520
export function rateFK(value: number): Rating {
  if (value < 130) return "sehr gering";
  if (value < 260) return "gering";
  if (value < 390) return "mittel";
  if (value < 520) return "hoch";
  return "sehr hoch";
}

// ─── nFK (nutzbare Feldkapazität) in Ltr./m²·We ─────────────────────────────
// Thresholds: <50, 50–90, 90–140, 140–200, >200
export function rateNFK(value: number): Rating {
  if (value < 50) return "sehr gering";
  if (value < 90) return "gering";
  if (value < 140) return "mittel";
  if (value < 200) return "hoch";
  return "sehr hoch";
}

// ─── Helper: get all ratings for a set of values ───────────────────────────
export interface SoilRatings {
  gpv: Rating;
  lk: Rating;
  fk: Rating;
  nfk: Rating;
}

export function rateAll(
  gpv: number,
  lk: number,
  fk: number,
  nfk: number,
): SoilRatings {
  return {
    gpv: rateGPV(gpv),
    lk: rateLK(lk),
    fk: rateFK(fk),
    nfk: rateNFK(nfk),
  };
}

// ─── Pore capacity calculation ──────────────────────────────────────────────

export interface PoreResult {
  gpv_pct: string;
  gpv_lm2: string;
  lk_pct: string;
  lk_lm2: string;
  fk_pct: string;
  fk_lm2: string;
  nfk_pct: string;
  nfk_lm2: string;
}

/**
 * Calculates all four pore capacity values (Vol%, l/m²) for a horizon.
 * Returns null if bodenart or lagerungsdichte cannot be resolved to a lookup entry.
 *
 * Pipeline: lookup base values → apply humus adjustment → apply skeleton correction → scale to l/m².
 */
export function calcPoreCapacities(
  bodenart: string,
  lagerungsdichte: string,
  humusPct: string,
  skelettPct: string,
  maechtigkDm: string,
): PoreResult | null {
  const base = lookupPoreValues(bodenart, lagerungsdichte);
  if (!base) return null;

  let gpv = base.totalPorosity;
  let lk = base.airCapacity;
  let fk = base.fieldCapacity;
  let nfk = base.availableWater;

  const humusNum = parseFloat(humusPct);
  if (!isNaN(humusNum) && humusNum > 0) {
    const group = soilGroupFromBodenart(bodenart);
    gpv += getHumusAdjustmentInterpolated(group, "total", humusNum);
    lk += getHumusAdjustmentInterpolated(group, "air", humusNum);
    fk += getHumusAdjustmentInterpolated(group, "field", humusNum);
    if (!isNaN(nfk))
      nfk += getHumusAdjustmentInterpolated(group, "available", humusNum);
  }

  const skelett = parseFloat(skelettPct);
  const skelFactor =
    !isNaN(skelett) && skelett >= 0 ? (100 - skelett) / 100 : 1;
  gpv = Math.max(0, gpv * skelFactor);
  lk = Math.max(0, lk * skelFactor);
  fk = Math.max(0, fk * skelFactor);
  nfk = isNaN(nfk) ? NaN : Math.max(0, nfk * skelFactor);

  const fmt = (v: number): string => (isNaN(v) ? "" : v.toFixed(1));
  const maechtigk = parseFloat(maechtigkDm);
  const fmtLm2 = (v: number): string =>
    !isNaN(v) && !isNaN(maechtigk) ? (v * maechtigk).toFixed(1) : "";

  return {
    gpv_pct: fmt(gpv),
    gpv_lm2: fmtLm2(gpv),
    lk_pct: fmt(lk),
    lk_lm2: fmtLm2(lk),
    fk_pct: fmt(fk),
    fk_lm2: fmtLm2(fk),
    nfk_pct: fmt(nfk),
    nfk_lm2: fmtLm2(nfk),
  };
}

// ─── KAK rating ─────────────────────────────────────────────────────────────
// Thresholds in cmolc/kg: <5, 5–10, 10–20, 20–40, 40–80, ≥80
export function rateKAK(value: number): Rating {
  if (value < 5) return "sehr gering";
  if (value < 10) return "gering";
  if (value < 20) return "mäßig";
  if (value < 40) return "mittel";
  if (value < 80) return "hoch";
  return "sehr hoch";
}

// ─── KAK (Kationenaustauschkapazität) ──────────────────────────────────────

const KAK_BASE: Record<string, number> = {
  gS: 1,
  mS: 2,
  fS: 2,
  Ss: 3,
  Su: 4,
  Su2: 4,
  Su3: 4,
  Su4: 4,
  Sl: 6,
  Sl2: 6,
  Sl3: 6,
  Sl4: 6,
  Uu: 6,
  Us: 6,
  St: 9,
  St2: 9,
  St3: 9,
  Slu: 9,
  Uls: 9,
  Ut: 12,
  Ut2: 12,
  Ut3: 12,
  Ut4: 12,
  Ls: 12,
  Ls2: 12,
  Ls3: 12,
  Ls4: 12,
  Lu: 15,
  Lt: 19,
  Lt2: 19,
  Lt3: 19,
  Lts: 19,
  Ts3: 19,
  Ts4: 19,
  Tu3: 19,
  Tu4: 19,
  Ts2: 29,
  Tu2: 29,
  Tl: 29,
  Tt: 38,
};

const HUMUS_KAK_FACTOR: Record<string, number> = {
  Rohhumus: 1.5,
  Moder: 2.0,
  Mull: 2.5,
};

/** Returns KAK in cmolc/kg, or empty string if bodenart is not in the lookup table. */
export function calcKAK(
  bodenart: string,
  humusform: string,
  humusPct: string,
): string {
  const base = KAK_BASE[bodenart.trim()];
  if (base === undefined) return "";
  const factor = HUMUS_KAK_FACTOR[humusform] ?? 0;
  const pct = parseFloat(humusPct);
  const humusContrib = !isNaN(pct) && pct > 0 && factor > 0 ? factor * pct : 0;
  return (base + humusContrib).toFixed(1);
}

// ─── S-Wert (Sorptionssumme) ─────────────────────────────────────────────────
// Thresholds in mol_c/m²·We: <1, 1–10, 10–50, 50–200, ≥200
export function rateSWert(value: number): Rating {
  if (value < 1) return "sehr gering";
  if (value < 10) return "gering";
  if (value < 50) return "mittel";
  if (value < 200) return "hoch";
  return "sehr hoch";
}

/**
 * Sums the S-Wert (KAK × BS/100 × LD × Mächtigkeit) over all horizons up to depthLimitCm.
 * Horizons with an uppercase 'A' in their name contribute fully (×1); all others ×0.5.
 * Depth-clipping follows the same proportional logic as calcProfileFKOrNFK.
 * Result is in mol_c/m²·We. Returns null if no horizon had all required values.
 */
export function calcProfileSWert(
  horizonte: Horizont[],
  depthLimitCm: number,
): number | null {
  if (isNaN(depthLimitCm) || depthLimitCm <= 0) return null;
  let total = 0;
  let hasAny = false;
  for (const h of horizonte) {
    const top = parseFloat(h.tiefe_oben ?? "");
    const bot = parseFloat(h.tiefe_unten ?? "");
    const kak = parseFloat(h.kak ?? "");
    const bs = parseFloat(h.basensaettigung ?? "");
    const ld = parseDensityMidpoint(h.lagerungsdichte ?? "");
    if (
      isNaN(top) ||
      isNaN(bot) ||
      isNaN(kak) ||
      isNaN(bs) ||
      ld === null ||
      bot <= top
    )
      continue;
    if (top >= depthLimitCm) continue;
    const clippedBot = Math.min(bot, depthLimitCm);
    const maechtigkDm = (clippedBot - top) / 10;
    const weight = /A/.test(h.horizontname ?? "") ? 1 : 0.5;
    total += kak * (bs / 100) * ld * maechtigkDm * weight;
    hasAny = true;
  }
  return hasAny ? total : null;
}

/**
 * Sums per-horizon fk_lm2 or nfk_lm2 up to depthLimitCm.
 * Horizons straddling the limit are clipped proportionally.
 * Returns null if no horizon contributed a valid value.
 */
export function calcProfileFKOrNFK(
  horizonte: Horizont[],
  depthLimitCm: number,
  field: "fk_lm2" | "nfk_lm2",
): number | null {
  if (isNaN(depthLimitCm) || depthLimitCm <= 0) return null;
  let total = 0;
  let hasAny = false;
  for (const h of horizonte) {
    const top = parseFloat(h.tiefe_oben ?? "");
    const bot = parseFloat(h.tiefe_unten ?? "");
    const val = parseFloat(h[field] ?? "");
    if (isNaN(top) || isNaN(bot) || isNaN(val) || bot <= top) continue;
    if (top >= depthLimitCm) continue;
    hasAny = true;
    if (bot <= depthLimitCm) {
      total += val;
    } else {
      total += (val * (depthLimitCm - top)) / (bot - top);
    }
  }
  return hasAny ? total : null;
}
