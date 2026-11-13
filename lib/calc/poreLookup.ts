// KA6 Tabelle B (Bodenphysikalische Kennwerte) — Vol-%-Werte für LK/FK/nFK
// in Abhängigkeit von Bodenart und Trockenrohdichte (TRD in g/cm³).
// Bezugswert Feldkapazität pF 1,8. TW (Poren ≤0,2 µm) wird hier nicht
// gespeichert; ein TW-bezogener Wert taucht nur in den Humuszuschlägen auf,
// um den nFK-Zuschlag aus FK_adj − TW_adj abzuleiten.

export interface SoilHydraulics {
  totalPorosity: number; // GPV = LK + FK (Vol-%)
  airCapacity: number; // LK (Vol-%)
  fieldCapacity: number; // FK (Vol-%)
  availableWater: number; // nFK (Vol-%)
}

interface TrdRow {
  trd: number; // g/cm³
  lk: number;
  fk: number;
  nfk: number;
}

// Each entry only lists TRD columns with values in the source table; rows
// outside the range are clamped during lookup.
export const SOIL_TABLE: Record<string, TrdRow[]> = {
  // ── Sande ──
  Ss: [
    { trd: 1.3, lk: 39, fk: 12, nfk: 10 },
    { trd: 1.5, lk: 31, fk: 13, nfk: 11 },
    { trd: 1.7, lk: 23, fk: 14, nfk: 12 },
  ],
  Sl2: [
    { trd: 1.3, lk: 29, fk: 22, nfk: 16 },
    { trd: 1.5, lk: 23, fk: 21, nfk: 15 },
    { trd: 1.7, lk: 17, fk: 20, nfk: 14 },
    { trd: 1.9, lk: 11, fk: 19, nfk: 13 },
  ],
  Sl3: [
    { trd: 1.3, lk: 24, fk: 27, nfk: 18 },
    { trd: 1.5, lk: 19, fk: 25, nfk: 16 },
    { trd: 1.7, lk: 13, fk: 24, nfk: 14 },
    { trd: 1.9, lk: 8, fk: 22, nfk: 12 },
  ],
  Sl4: [
    { trd: 1.3, lk: 22, fk: 29, nfk: 18 },
    { trd: 1.5, lk: 17, fk: 27, nfk: 16 },
    { trd: 1.7, lk: 12, fk: 25, nfk: 14 },
    { trd: 1.9, lk: 6, fk: 23, nfk: 12 },
  ],
  Slu: [
    { trd: 1.3, lk: 17, fk: 34, nfk: 23 },
    { trd: 1.5, lk: 12, fk: 32, nfk: 21 },
    { trd: 1.7, lk: 7, fk: 30, nfk: 18 },
    { trd: 1.9, lk: 2, fk: 28, nfk: 16 },
  ],
  St2: [
    { trd: 1.3, lk: 33, fk: 18, nfk: 12 },
    { trd: 1.5, lk: 26, fk: 18, nfk: 12 },
    { trd: 1.7, lk: 19, fk: 18, nfk: 12 },
    { trd: 1.9, lk: 12, fk: 18, nfk: 11 },
  ],
  St3: [
    { trd: 1.3, lk: 27, fk: 24, nfk: 13 },
    { trd: 1.5, lk: 22, fk: 22, nfk: 11 },
    { trd: 1.7, lk: 15, fk: 22, nfk: 11 },
    { trd: 1.9, lk: 9, fk: 21, nfk: 11 },
  ],
  Su2: [
    { trd: 1.3, lk: 30, fk: 21, nfk: 16 },
    { trd: 1.5, lk: 24, fk: 20, nfk: 15 },
    { trd: 1.7, lk: 18, fk: 19, nfk: 14 },
    { trd: 1.9, lk: 12, fk: 18, nfk: 13 },
  ],
  Su3: [
    { trd: 1.3, lk: 23, fk: 28, nfk: 21 },
    { trd: 1.5, lk: 18, fk: 26, nfk: 18 },
    { trd: 1.7, lk: 13, fk: 24, nfk: 16 },
    { trd: 1.9, lk: 8, fk: 22, nfk: 14 },
  ],
  Su4: [
    { trd: 1.3, lk: 19, fk: 32, nfk: 24 },
    { trd: 1.5, lk: 14, fk: 30, nfk: 22 },
    { trd: 1.7, lk: 9, fk: 28, nfk: 19 },
    { trd: 1.9, lk: 4, fk: 26, nfk: 17 },
  ],

  // ── Lehme ──
  Ls2: [
    { trd: 1.1, lk: 20, fk: 39, nfk: 23 },
    { trd: 1.3, lk: 14, fk: 37, nfk: 21 },
    { trd: 1.5, lk: 9, fk: 35, nfk: 19 },
    { trd: 1.7, lk: 5, fk: 32, nfk: 16 },
    { trd: 1.9, lk: 1, fk: 29, nfk: 13 },
  ],
  Ls3: [
    { trd: 1.1, lk: 23, fk: 36, nfk: 21 },
    { trd: 1.3, lk: 17, fk: 34, nfk: 19 },
    { trd: 1.5, lk: 12, fk: 32, nfk: 17 },
    { trd: 1.7, lk: 8, fk: 29, nfk: 14 },
    { trd: 1.9, lk: 3, fk: 27, nfk: 12 },
  ],
  Ls4: [
    { trd: 1.1, lk: 27, fk: 32, nfk: 19 },
    { trd: 1.3, lk: 21, fk: 30, nfk: 17 },
    { trd: 1.5, lk: 16, fk: 28, nfk: 15 },
    { trd: 1.7, lk: 11, fk: 26, nfk: 13 },
    { trd: 1.9, lk: 6, fk: 24, nfk: 11 },
  ],
  Lt2: [
    { trd: 1.1, lk: 18, fk: 41, nfk: 21 },
    { trd: 1.3, lk: 13, fk: 38, nfk: 18 },
    { trd: 1.5, lk: 9, fk: 35, nfk: 15 },
    { trd: 1.7, lk: 5, fk: 32, nfk: 12 },
  ],
  Lt3: [
    { trd: 1.1, lk: 14, fk: 45, nfk: 20 },
    { trd: 1.3, lk: 9, fk: 42, nfk: 17 },
    { trd: 1.5, lk: 6, fk: 38, nfk: 13 },
    { trd: 1.7, lk: 3, fk: 34, nfk: 10 },
  ],
  Lts: [
    { trd: 1.1, lk: 20, fk: 39, nfk: 19 },
    { trd: 1.3, lk: 15, fk: 36, nfk: 16 },
    { trd: 1.5, lk: 11, fk: 33, nfk: 13 },
    { trd: 1.7, lk: 7, fk: 30, nfk: 10 },
  ],
  Lu: [
    { trd: 1.1, lk: 17, fk: 42, nfk: 24 },
    { trd: 1.3, lk: 12, fk: 39, nfk: 21 },
    { trd: 1.5, lk: 8, fk: 36, nfk: 18 },
    { trd: 1.7, lk: 4, fk: 33, nfk: 15 },
  ],

  // ── Schluffe ──
  Uu: [
    { trd: 1.1, lk: 20, fk: 39, nfk: 30 },
    { trd: 1.3, lk: 14, fk: 37, nfk: 28 },
    { trd: 1.5, lk: 8, fk: 36, nfk: 27 },
    { trd: 1.7, lk: 3, fk: 34, nfk: 24 },
  ],
  Uls: [
    { trd: 1.1, lk: 21, fk: 38, nfk: 26 },
    { trd: 1.3, lk: 15, fk: 36, nfk: 24 },
    { trd: 1.5, lk: 10, fk: 34, nfk: 22 },
    { trd: 1.7, lk: 5, fk: 32, nfk: 19 },
  ],
  Us: [
    { trd: 1.1, lk: 22, fk: 37, nfk: 29 },
    { trd: 1.3, lk: 16, fk: 35, nfk: 27 },
    { trd: 1.5, lk: 11, fk: 33, nfk: 24 },
    { trd: 1.7, lk: 6, fk: 31, nfk: 21 },
  ],
  Ut2: [
    { trd: 1.1, lk: 20, fk: 39, nfk: 28 },
    { trd: 1.3, lk: 14, fk: 37, nfk: 26 },
    { trd: 1.5, lk: 8, fk: 36, nfk: 25 },
    { trd: 1.7, lk: 3, fk: 34, nfk: 23 },
  ],
  Ut3: [
    { trd: 1.1, lk: 19, fk: 40, nfk: 27 },
    { trd: 1.3, lk: 13, fk: 38, nfk: 26 },
    { trd: 1.5, lk: 7, fk: 37, nfk: 24 },
    { trd: 1.7, lk: 2, fk: 35, nfk: 22 },
  ],
  Ut4: [
    { trd: 1.1, lk: 18, fk: 41, nfk: 25 },
    { trd: 1.3, lk: 12, fk: 39, nfk: 23 },
    { trd: 1.5, lk: 7, fk: 37, nfk: 21 },
    { trd: 1.7, lk: 2, fk: 35, nfk: 19 },
  ],

  // ── Tone ──
  Tt: [
    { trd: 1.1, lk: 6, fk: 53, nfk: 17 },
    { trd: 1.3, lk: 4, fk: 48, nfk: 15 },
    { trd: 1.5, lk: 2, fk: 42, nfk: 10 },
  ],
  Tl: [
    { trd: 1.1, lk: 11, fk: 48, nfk: 18 },
    { trd: 1.3, lk: 7, fk: 44, nfk: 15 },
    { trd: 1.5, lk: 4, fk: 40, nfk: 11 },
    { trd: 1.7, lk: 2, fk: 35, nfk: 9 },
  ],
  Tu2: [
    { trd: 1.1, lk: 9, fk: 50, nfk: 19 },
    { trd: 1.3, lk: 6, fk: 46, nfk: 16 },
    { trd: 1.5, lk: 3, fk: 41, nfk: 12 },
    { trd: 1.7, lk: 1, fk: 36, nfk: 9 },
  ],
  Tu3: [
    { trd: 1.1, lk: 12, fk: 47, nfk: 21 },
    { trd: 1.3, lk: 8, fk: 43, nfk: 18 },
    { trd: 1.5, lk: 5, fk: 39, nfk: 14 },
    { trd: 1.7, lk: 2, fk: 35, nfk: 10 },
  ],
  Tu4: [
    { trd: 1.1, lk: 14, fk: 45, nfk: 25 },
    { trd: 1.3, lk: 10, fk: 41, nfk: 21 },
    { trd: 1.5, lk: 6, fk: 38, nfk: 18 },
    { trd: 1.7, lk: 2, fk: 35, nfk: 15 },
  ],
  Ts2: [
    { trd: 1.3, lk: 13, fk: 38, nfk: 14 },
    { trd: 1.5, lk: 9, fk: 35, nfk: 11 },
    { trd: 1.7, lk: 6, fk: 31, nfk: 9 },
  ],
  Ts3: [
    { trd: 1.3, lk: 17, fk: 34, nfk: 14 },
    { trd: 1.5, lk: 13, fk: 31, nfk: 11 },
    { trd: 1.7, lk: 9, fk: 28, nfk: 9 },
  ],
  Ts4: [
    { trd: 1.3, lk: 21, fk: 30, nfk: 15 },
    { trd: 1.5, lk: 16, fk: 28, nfk: 13 },
    { trd: 1.7, lk: 11, fk: 26, nfk: 11 },
  ],

  // ── Reine Sandfraktionen ──
  fS: [
    { trd: 1.3, lk: 34, fk: 17, nfk: 14 },
    { trd: 1.5, lk: 26, fk: 18, nfk: 15 },
    { trd: 1.7, lk: 18, fk: 19, nfk: 16 },
  ],
  mS: [
    { trd: 1.3, lk: 39, fk: 12, nfk: 10 },
    { trd: 1.5, lk: 31, fk: 13, nfk: 11 },
    { trd: 1.7, lk: 23, fk: 14, nfk: 12 },
  ],
  gS: [
    { trd: 1.3, lk: 42, fk: 9, nfk: 7 },
    { trd: 1.5, lk: 34, fk: 10, nfk: 8 },
    { trd: 1.7, lk: 26, fk: 11, nfk: 9 },
  ],
};

// ─── Humuszuschläge (KA6 Tabelle B6) ──────────────────────────────────────
// Vol-%-Zuschläge pro Bodenart × Humusgehaltsstufe. Aus den drei Quellspalten
// GPV, FK (Poren ≤50 µm) und TW (Poren ≤0,2 µm) lassen sich LK und nFK
// volumenerhaltend ableiten:
//   LK_adj  = GPV_adj − FK_adj    (LK = GPV − FK)
//   nFK_adj = FK_adj  − TW_adj    (nFK = FK − TW)
// Bei Ss ist TW nicht angegeben; in dem Fall nehmen wir nFK_adj = FK_adj.

interface HumusAdjRow {
  gpv: [number, number, number, number]; // h2, h3, h4, h5
  fk: [number, number, number, number];
  tw: [number, number, number, number] | null;
}

export const HUMUS_ADJ_TABLE: Record<string, HumusAdjRow> = {
  Ss: { gpv: [2, 4, 7, 15], fk: [3, 5, 10, 20], tw: null },
  Sl2: { gpv: [2, 4, 7, 14], fk: [2, 5, 9, 17], tw: [1, 2, 4, 7] },
  Sl3: { gpv: [2, 4, 8, 15], fk: [2, 4, 9, 16], tw: [1, 2, 3, 6] },
  Sl4: { gpv: [3, 5, 9, 15], fk: [2, 4, 8, 15], tw: [1, 1, 3, 5] },
  Slu: { gpv: [3, 5, 9, 16], fk: [2, 4, 7, 14], tw: [1, 1, 3, 5] },
  St2: { gpv: [2, 4, 8, 14], fk: [2, 5, 10, 17], tw: [1, 1, 2, 4] },
  St3: { gpv: [2, 5, 9, 15], fk: [2, 5, 9, 16], tw: [1, 2, 3, 7] },
  Su2: { gpv: [2, 4, 8, 15], fk: [2, 5, 10, 18], tw: [1, 2, 3, 6] },
  Su3: { gpv: [2, 5, 9, 15], fk: [2, 5, 9, 16], tw: [1, 2, 3, 6] },
  Su4: { gpv: [2, 5, 8, 15], fk: [2, 5, 8, 15], tw: [1, 2, 3, 5] },
  Ls2: { gpv: [3, 6, 9, 16], fk: [2, 4, 7, 13], tw: [1, 1, 2, 5] },
  Ls3: { gpv: [3, 5, 9, 16], fk: [2, 4, 7, 14], tw: [1, 1, 2, 4] },
  Ls4: { gpv: [3, 5, 9, 15], fk: [2, 4, 8, 14], tw: [1, 1, 2, 4] },
  Lt2: { gpv: [3, 5, 9, 16], fk: [2, 3, 6, 11], tw: [0, 1, 2, 3] },
  Lt3: { gpv: [3, 6, 10, 17], fk: [1, 3, 6, 11], tw: [0, 1, 2, 3] },
  Lts: { gpv: [3, 6, 10, 17], fk: [2, 4, 7, 13], tw: [1, 1, 2, 3] },
  Lu: { gpv: [3, 5, 9, 16], fk: [1, 3, 6, 11], tw: [0, 1, 1, 3] },
  Uu: { gpv: [1, 4, 7, 14], fk: [1, 3, 5, 10], tw: [0, 1, 2, 3] },
  Uls: { gpv: [3, 6, 9, 16], fk: [2, 4, 6, 12], tw: [0, 1, 2, 3] },
  Us: { gpv: [2, 5, 8, 15], fk: [2, 4, 6, 12], tw: [0, 1, 2, 4] },
  Ut2: { gpv: [3, 6, 10, 16], fk: [2, 4, 7, 11], tw: [0, 1, 2, 3] },
  Ut3: { gpv: [3, 6, 11, 17], fk: [2, 4, 7, 11], tw: [0, 1, 2, 3] },
  Ut4: { gpv: [4, 7, 11, 16], fk: [2, 4, 7, 10], tw: [0, 1, 2, 3] },
  Tt: { gpv: [4, 6, 9, 15], fk: [1, 2, 4, 8], tw: [0, 1, 1, 2] },
  Tl: { gpv: [3, 6, 9, 14], fk: [1, 2, 4, 8], tw: [0, 1, 1, 2] },
  Tu2: { gpv: [3, 6, 9, 15], fk: [1, 2, 4, 8], tw: [0, 1, 1, 2] },
  Tu3: { gpv: [3, 4, 9, 15], fk: [1, 2, 5, 8], tw: [0, 1, 1, 2] },
  Tu4: { gpv: [3, 5, 9, 16], fk: [1, 2, 5, 9], tw: [0, 1, 1, 2] },
  Ts2: { gpv: [4, 6, 11, 18], fk: [2, 3, 7, 13], tw: [1, 1, 2, 4] },
  Ts3: { gpv: [3, 6, 11, 18], fk: [2, 4, 8, 14], tw: [1, 1, 2, 4] },
  Ts4: { gpv: [3, 6, 10, 17], fk: [2, 4, 8, 14], tw: [1, 1, 2, 4] },
};

export type HumusClass = "h2" | "h3" | "h4" | "h5";

const HUMUS_MIDPOINTS: Record<HumusClass, number> = {
  h2: 1.5,
  h3: 3.5,
  h4: 7.5,
  h5: 12.5,
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Linear interpolation among the 4 humus midpoints (1.5 / 3.5 / 7.5 / 12.5 %). */
function interpHumus(
  values: [number, number, number, number],
  humusPct: number,
): number {
  const mids = [
    HUMUS_MIDPOINTS.h2,
    HUMUS_MIDPOINTS.h3,
    HUMUS_MIDPOINTS.h4,
    HUMUS_MIDPOINTS.h5,
  ];
  if (humusPct <= mids[0]) return values[0];
  if (humusPct >= mids[3]) return values[3];
  for (let i = 0; i < 3; i++) {
    if (humusPct <= mids[i + 1]) {
      const t = (humusPct - mids[i]) / (mids[i + 1] - mids[i]);
      return lerp(values[i], values[i + 1], t);
    }
  }
  return values[3];
}

/**
 * Korrigiert die Basis-Porenkennwerte um den Humuszuschlag (KA6 Tabelle B6).
 * Volumenkonsistent: GPV und FK (sowie TW) werden additiv korrigiert,
 * LK und nFK werden **nachträglich** aus den korrigierten Werten abgeleitet:
 *   LK_corr  = GPV_corr − FK_corr
 *   nFK_corr = FK_corr  − TW_corr      (bei fehlender TW-Spalte: nFK_corr = FK_corr − TW_base)
 *
 * Liefert die Basiswerte unverändert zurück, wenn die Bodenart nicht in
 * `HUMUS_ADJ_TABLE` steht oder `humusPct <= 0` ist.
 */
export function applyHumusCorrection(
  bodenart: string,
  base: SoilHydraulics,
  humusPct: number,
): SoilHydraulics {
  if (!(humusPct > 0)) return base;
  const key = bodenartToHumusKey(bodenart);
  if (!key) return base;
  const row = HUMUS_ADJ_TABLE[key];

  const twBase = base.fieldCapacity - base.availableWater;
  const gpvCorr = base.totalPorosity + interpHumus(row.gpv, humusPct);
  const fkCorr = base.fieldCapacity + interpHumus(row.fk, humusPct);
  const twCorr = row.tw ? twBase + interpHumus(row.tw, humusPct) : twBase;

  const lkCorr = gpvCorr - fkCorr;
  const nfkCorr = fkCorr - twCorr;

  return {
    totalPorosity: gpvCorr,
    fieldCapacity: fkCorr,
    airCapacity: lkCorr,
    availableWater: nfkCorr,
  };
}

/**
 * Mappt eine KA5/KA6-Bodenart auf einen Schlüssel in `SOIL_TABLE`.
 * Akzeptiert exakte Codes sowie nackte Sammelnamen (`Sl`, `Su`, …) als
 * Rückfallpfad — die werden auf die erste vorhandene Subdivision abgebildet.
 */
export function bodenartToLookupKey(bodenart: string): string | null {
  const s = bodenart.trim();
  if (s in SOIL_TABLE) return s;
  const bareFallback: Record<string, string[]> = {
    Sl: ["Sl2", "Sl3", "Sl4"],
    Su: ["Su2", "Su3", "Su4"],
    St: ["St2", "St3"],
    Ls: ["Ls2", "Ls3", "Ls4"],
    Lt: ["Lt2", "Lt3"],
    Ts: ["Ts2", "Ts3", "Ts4"],
    Tu: ["Tu2", "Tu3", "Tu4"],
    Ut: ["Ut2", "Ut3", "Ut4"],
  };
  return bareFallback[s]?.[0] ?? null;
}

/** Wie `bodenartToLookupKey`, aber gegen `HUMUS_ADJ_TABLE` (gleiche Keys). */
function bodenartToHumusKey(bodenart: string): string | null {
  const key = bodenartToLookupKey(bodenart);
  return key && key in HUMUS_ADJ_TABLE ? key : null;
}

/**
 * Parst einen freien Trockenrohdichte-String (z. B. "1,2–1,4 kg/dm³",
 * ">1.65", "<1.45", "1.6") zu einem repräsentativen Wert in g/cm³.
 * Für Bereiche der arithmetische Mittelwert; für `>x` / `<x` ein Heuristik-
 * Punkt mit ±0.15 Offset.
 */
export function parseDensityMidpoint(density: string): number | null {
  const s = density.replace(/,/g, ".").replace(/[–−]/g, "-");
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

/** Linearer Interpolations-Helper über die TRD-Stützstellen einer Bodenart. */
function interpTrd(
  rows: TrdRow[],
  trd: number,
  pick: (r: TrdRow) => number,
): number {
  if (trd <= rows[0].trd) return pick(rows[0]);
  if (trd >= rows[rows.length - 1].trd) return pick(rows[rows.length - 1]);
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i];
    const b = rows[i + 1];
    if (trd <= b.trd) {
      const t = (trd - a.trd) / (b.trd - a.trd);
      return lerp(pick(a), pick(b), t);
    }
  }
  return pick(rows[rows.length - 1]);
}

/**
 * Liefert die Basis-Porenkennwerte (Vol-%) für eine Bodenart und einen
 * Trockenrohdichte-String. Zwischen den TRD-Spalten (1.1 / 1.3 / 1.5 / 1.7 /
 * 1.9 g/cm³) wird linear interpoliert; Werte außerhalb des Stützbereichs
 * werden auf den nächsten Eckwert geklemmt.
 */
export function lookupPoreValues(
  bodenart: string,
  density: string,
): SoilHydraulics | null {
  const key = bodenartToLookupKey(bodenart);
  if (!key) return null;
  const rows = SOIL_TABLE[key];
  if (!rows || rows.length === 0) return null;
  const trd = parseDensityMidpoint(density);
  if (trd === null || isNaN(trd)) return null;
  const lk = interpTrd(rows, trd, (r) => r.lk);
  const fk = interpTrd(rows, trd, (r) => r.fk);
  const nfk = interpTrd(rows, trd, (r) => r.nfk);
  return {
    airCapacity: lk,
    fieldCapacity: fk,
    availableWater: nfk,
    totalPorosity: lk + fk,
  };
}
