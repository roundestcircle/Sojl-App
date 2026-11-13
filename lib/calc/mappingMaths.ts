import {
  lookupPoreValues,
  applyHumusCorrection,
  parseDensityMidpoint,
} from "@/lib/calc/poreLookup";
import type { Horizont } from "@/lib/db/horizontQueries";
import { parseDecimal } from "@/lib/number";

/** Returns Mächtigkeit in dm (one decimal), or empty string if inputs are invalid. */
export function calcMaechtigkeitDm(
  tiefeOben: string,
  tiefeUnten: string,
): string {
  const von = parseDecimal(tiefeOben);
  const bis = parseDecimal(tiefeUnten);
  return von !== null && bis !== null && bis > von
    ? ((bis - von) / 10).toFixed(1)
    : "";
}

/**
 * Gründigkeit in cm = depth of the deepest horizon's lower boundary.
 * Empty string if no horizon has a valid lower depth.
 */
export function calcGrundigkeitCm(tiefenUnten: (string | null)[]): string {
  const depths = tiefenUnten
    .map(parseDecimal)
    .filter((v): v is number => v !== null && v > 0);
  return depths.length > 0 ? String(Math.round(Math.max(...depths))) : "";
}

// ─── Rating categories ──────────────────────────────────────────────────────
// Superset of all KA6 rating labels. Not every metric uses every bucket —
// KA6 defines different threshold scales per property (e.g. rateGPV/LK/FK/NFK/SWert
// use a 5-bucket scale without "mäßig"; only rateKAK uses all 6).
export type Rating =
  "sehr gering" | "gering" | "mäßig" | "mittel" | "hoch" | "sehr hoch";

/** Label of the first class whose (exclusive) upper bound exceeds `value`. */
function rate(
  value: number,
  upperBounds: readonly number[],
  labels: readonly Rating[],
): Rating {
  const i = upperBounds.findIndex((t) => value < t);
  return labels[i === -1 ? upperBounds.length : i];
}

const FIVE_CLASSES: readonly Rating[] = [
  "sehr gering",
  "gering",
  "mittel",
  "hoch",
  "sehr hoch",
];

// ─── KA6 Tabelle B9 — Vol-%-Schwellen (Bezug pF 1,8) ────────────────────────

export const rateGPV = (v: number) => rate(v, [35, 40, 47, 56], FIVE_CLASSES);
export const rateLK = (v: number) => rate(v, [4, 8, 14, 22], FIVE_CLASSES);
export const rateFK_pct = (v: number) =>
  rate(v, [22, 30, 38, 46], FIVE_CLASSES);
export const rateNFK_pct = (v: number) =>
  rate(v, [11, 15, 20, 26], FIVE_CLASSES);

// ─── KA5-Profilsummen-Schwellen in Ltr./m²·We ───────────────────────────────
// Werden auf die Profilsummen (`calcProfileFKOrNFK`) angewandt; AufnahmeForm
// kennzeichnet die Anzeige zusätzlich mit "(KA5)".

export const rateFK = (v: number) =>
  rate(v, [130, 260, 390, 520], FIVE_CLASSES);
export const rateNFK = (v: number) => rate(v, [50, 90, 140, 200], FIVE_CLASSES);

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
 * Humus content (%) from which a horizon is anmoorig (h6); the KA6 pore tables
 * and humus corrections only cover mineral soils below it.
 */
const MAX_MINERAL_HUMUS_PCT = 15;

/**
 * Calculates all four pore capacity values (Vol%, l/m²) for a horizon.
 * Returns null if bodenart or trockenrohdichte cannot be resolved to a lookup
 * entry, humus % is missing, or the horizon is anmoorig (humus ≥ 15 %).
 *
 * Pipeline: lookup base values → apply humus adjustment → apply skeleton correction → scale to l/m².
 */
export function calcPoreCapacities(
  bodenart: string,
  trockenrohdichte: string,
  humusPct: string,
  skelettPct: string,
  maechtigkDm: string,
): PoreResult | null {
  const base = lookupPoreValues(bodenart, trockenrohdichte);
  const humus = parseDecimal(humusPct);
  if (!base || humus === null || humus >= MAX_MINERAL_HUMUS_PCT) return null;

  const corrected = applyHumusCorrection(bodenart, base, humus);
  const skelett = parseDecimal(skelettPct);
  const skelFactor =
    skelett !== null && skelett >= 0 ? (100 - skelett) / 100 : 1;
  const scaled = (v: number) => Math.max(0, v * skelFactor);
  const gpv = scaled(corrected.totalPorosity);
  const lk = scaled(corrected.airCapacity);
  const fk = scaled(corrected.fieldCapacity);
  const nfk = scaled(corrected.availableWater);

  const maechtigk = parseDecimal(maechtigkDm);
  const lm2 = (v: number) =>
    maechtigk !== null ? (v * maechtigk).toFixed(1) : "";

  return {
    gpv_pct: gpv.toFixed(1),
    gpv_lm2: lm2(gpv),
    lk_pct: lk.toFixed(1),
    lk_lm2: lm2(lk),
    fk_pct: fk.toFixed(1),
    fk_lm2: lm2(fk),
    nfk_pct: nfk.toFixed(1),
    nfk_lm2: lm2(nfk),
  };
}

// ─── KAK rating ─────────────────────────────────────────────────────────────
// Thresholds in cmolc/kg: <5, 5–10, 10–20, 20–40, 40–80, ≥80
export const rateKAK = (v: number) =>
  rate(
    v,
    [5, 10, 20, 40, 80],
    ["sehr gering", "gering", "mäßig", "mittel", "hoch", "sehr hoch"],
  );

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

const HUMUS_KAK_FACTOR = {
  Rohhumus: 1.5,
  Moder: 2.0,
  Mull: 2.5,
} as const;

export type Humusform = keyof typeof HUMUS_KAK_FACTOR;

/** Humusformen with a KAK factor (single source for the KAK tool and the Standort form). */
export const HUMUSFORMEN = Object.keys(HUMUS_KAK_FACTOR) as Humusform[];

/**
 * KAK in cmolc/kg = KAK of the mineral fraction (by Bodenart) + humus factor
 * (by Humusform) × humus %. Empty string if the Bodenart is not in the lookup
 * table or Humusform / humus % are missing — the value would be mineral-only.
 */
export function calcKAK(
  bodenart: string,
  humusform: string,
  humusPct: string,
): string {
  const base = KAK_BASE[bodenart.trim()];
  const factor: number | undefined = HUMUS_KAK_FACTOR[humusform as Humusform];
  const pct = parseDecimal(humusPct);
  if (base === undefined || factor === undefined || pct === null || pct < 0) {
    return "";
  }
  return (base + factor * pct).toFixed(1);
}

// ─── S-Wert (Sorptionssumme) ─────────────────────────────────────────────────
// Thresholds in cmol_c/m²·We: <100, 100–1000, 1000–5000, 5000–20000, ≥20000
// (= 1 / 10 / 50 / 200 mol_c/m²·We).
export const rateSWert = (v: number) =>
  rate(v, [100, 1000, 5000, 20000], FIVE_CLASSES);

// ─── Profile sums ───────────────────────────────────────────────────────────

/**
 * Result of a profile sum: the value, "unvollständig" when the horizons in the
 * depth range have gaps, overlaps or missing values, or null when there is
 * nothing to sum (no valid depth limit / no horizon within it).
 */
export type ProfileSum = number | "unvollständig" | null;

type ClippedHorizont = { h: Horizont; top: number; bot: number; dm: number };

/**
 * Returns the horizons that intersect [0, depthLimitCm] sorted by depth, each
 * with its thickness clipped to the limit (dm) — or "unvollständig" when they
 * don't cover the range contiguously from 0 (gap, overlap or invalid depths).
 * The profile may end above the limit (e.g. on bedrock).
 */
function clipToDepth(
  horizonte: Horizont[],
  depthLimitCm: number,
): ClippedHorizont[] | "unvollständig" | null {
  if (!(depthLimitCm > 0)) return null;
  const rows: ClippedHorizont[] = [];
  for (const h of horizonte) {
    const top = parseDecimal(h.tiefe_oben);
    const bot = parseDecimal(h.tiefe_unten);
    if (top === null || bot === null || bot <= top) return "unvollständig";
    if (top >= depthLimitCm) continue;
    rows.push({ h, top, bot, dm: (Math.min(bot, depthLimitCm) - top) / 10 });
  }
  if (rows.length === 0) return null;
  rows.sort((a, b) => a.top - b.top);
  let expectedTop = 0;
  for (const r of rows) {
    if (r.top !== expectedTop) return "unvollständig";
    expectedTop = r.bot;
  }
  return rows;
}

/**
 * Sums the S-Wert over all horizons up to depthLimitCm. Result in cmol_c/m²·We.
 *
 * Per horizon: KAK [cmol_c/kg] × BS/100 × TRD [kg/dm³] × Mächtigkeit [dm]
 * = cmol_c/dm², × 100 dm²/m² → cmol_c/m². (The BS/100 and ×100 cancel out.)
 *
 * Horizons with an uppercase 'A' in their name contribute fully (×1); all
 * others ×0.5. Horizons straddling the limit are clipped proportionally.
 */
export function calcProfileSWert(
  horizonte: Horizont[],
  depthLimitCm: number,
): ProfileSum {
  const rows = clipToDepth(horizonte, depthLimitCm);
  if (rows === null || rows === "unvollständig") return rows;
  let total = 0;
  for (const { h, dm } of rows) {
    const kak = parseDecimal(h.kak);
    const bs = parseDecimal(h.basensaettigung);
    const trd = parseDensityMidpoint(h.trockenrohdichte ?? "");
    if (kak === null || bs === null || trd === null) return "unvollständig";
    // A-Horizonte (Ah, Ap, fAh, rAp, …): optional lowercase prefix(es) then capital A.
    const weight = /^[a-z]*A/.test(h.horizontname ?? "") ? 1 : 0.5;
    total += kak * bs * trd * dm * weight;
  }
  return total;
}

/**
 * Sums per-horizon fk_lm2 or nfk_lm2 up to depthLimitCm.
 * Horizons straddling the limit are clipped proportionally.
 */
export function calcProfileFKOrNFK(
  horizonte: Horizont[],
  depthLimitCm: number,
  field: "fk_lm2" | "nfk_lm2",
): ProfileSum {
  const rows = clipToDepth(horizonte, depthLimitCm);
  if (rows === null || rows === "unvollständig") return rows;
  let total = 0;
  for (const { h, top, bot } of rows) {
    const val = parseDecimal(h[field]);
    if (val === null) return "unvollständig";
    total += (val * (Math.min(bot, depthLimitCm) - top)) / (bot - top);
  }
  return total;
}
