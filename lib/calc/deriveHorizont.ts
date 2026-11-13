import {
  calcKAK,
  calcMaechtigkeitDm,
  calcPoreCapacities,
  type PoreResult,
} from "@/lib/calc/mappingMaths";
import { calcBasensaettigung } from "@/lib/calc/basensaettigungLookup";
import { lookupTrockenrohdichte } from "@/lib/calc/trockenrohdichteLookup";
import { estimateHumusFromInputs, humusKlasse } from "@/lib/calc/renger1987";
import { parseDecimal } from "@/lib/number";

/** User-entered Horizont fields the automatic values depend on (as form text). */
export const HORIZONT_CALC_INPUTS = [
  "farbe_munsell",
  "ph_cacl2",
  "tonanteil",
  "bodenart",
  "packungsdichte",
  "tiefe_oben",
  "tiefe_unten",
  "anteil",
] as const;

export type HorizontCalcInput = (typeof HORIZONT_CALC_INPUTS)[number];

export type HorizontCalcInputs = Record<HorizontCalcInput, string> & {
  /** Humusform of the parent Aufnahme (needed for the KAK). */
  humusform: string;
};

/** Automatically calculated ("Automatisch berechnete Werte") Horizont fields. */
export const HORIZONT_DERIVED_FIELDS = [
  "maechtigk_dm",
  "trockenrohdichte",
  "humus_pct",
  "humus",
  "kak",
  "basensaettigung",
  "gpv_pct",
  "gpv_lm2",
  "lk_pct",
  "lk_lm2",
  "fk_pct",
  "fk_lm2",
  "nfk_pct",
  "nfk_lm2",
] as const;

export type HorizontDerived = Record<
  (typeof HORIZONT_DERIVED_FIELDS)[number],
  string
>;

const NO_PORES: PoreResult = {
  gpv_pct: "",
  gpv_lm2: "",
  lk_pct: "",
  lk_lm2: "",
  fk_pct: "",
  fk_lm2: "",
  nfk_pct: "",
  nfk_lm2: "",
};

/**
 * Computes every automatic Horizont value from the user inputs, in dependency
 * order (each value empty when its inputs are missing):
 *
 *   Farbe + pH + Tonanteil ──► Humus % ──► Humusklasse, KAK (+ Humusform), BS
 *   Bodenart + Packungsdichte ──► TRD ──┐
 *   Tiefe oben/unten ──► Mächtigkeit ───┼──► GPV / LK / FK / nFK (Vol% + l/m²)
 *   Humus %, Skelettanteil ─────────────┘
 */
export function deriveHorizont(i: HorizontCalcInputs): HorizontDerived {
  const maechtigk_dm = calcMaechtigkeitDm(i.tiefe_oben, i.tiefe_unten);
  const trockenrohdichte = lookupTrockenrohdichte(i.bodenart, i.packungsdichte);
  const estimate = estimateHumusFromInputs(
    i.farbe_munsell,
    i.ph_cacl2,
    i.tonanteil,
  );
  const humus_pct = estimate ? String(estimate.pct) : "";
  const ph = parseDecimal(i.ph_cacl2);

  return {
    maechtigk_dm,
    trockenrohdichte,
    humus_pct,
    humus: estimate && estimate.pct > 0 ? humusKlasse(estimate.pct).klasse : "",
    kak: calcKAK(i.bodenart, i.humusform, humus_pct),
    basensaettigung:
      ph === null ? "" : calcBasensaettigung(String(ph), humus_pct),
    ...(calcPoreCapacities(
      i.bodenart,
      trockenrohdichte,
      humus_pct,
      i.anteil,
      maechtigk_dm,
    ) ?? NO_PORES),
  };
}
