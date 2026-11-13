import type { HorizontData } from "@/lib/db/horizontQueries";
import {
  HORIZONT_DATA_COLUMNS,
  type HorizontDataColumn,
} from "@/lib/db/columns";
import { parseDecimal } from "@/lib/number";

// ─── Form shape ────────────────────────────────────────────────────────────────

/**
 * One string field per stored data column (see lib/db/columns.ts); the sample
 * numbers are a field array.
 */
export type HorizontFormData = Record<
  Exclude<HorizontDataColumn, "probennummern">,
  string
> & {
  probennummern: { value: string }[];
};

/** Determination tool / lexicon that can be opened from the form. */
export type HorizontTool =
  | "farbe"
  | "bodenart"
  | "anteil"
  | "carbonat"
  | "packungsdichte"
  | "feinwurzeln"
  | "gefuege"
  | "lexikon";

/** Columns stored 1:1 as text (everything except pH and probennummern). */
const TEXT_COLUMNS = HORIZONT_DATA_COLUMNS.filter(
  (c): c is Exclude<HorizontDataColumn, "ph_cacl2" | "probennummern"> =>
    c !== "ph_cacl2" && c !== "probennummern",
);

/** Parses the JSON-encoded probennummern column into field-array entries. */
function parseProbennummern(json: string | null | undefined) {
  try {
    return (JSON.parse(json ?? "[]") as string[]).map((v) => ({ value: v }));
  } catch {
    return [];
  }
}

// ─── DB row ⇄ form values ─────────────────────────────────────────────────────

/** Builds react-hook-form default values from a (possibly partial) DB row. */
export function toHorizontFormDefaults(
  row?: Partial<HorizontData> | null,
): HorizontFormData {
  const values = {} as HorizontFormData;
  for (const c of TEXT_COLUMNS) values[c] = row?.[c] ?? "";
  values.ph_cacl2 = row?.ph_cacl2 != null ? String(row.ph_cacl2) : "";
  values.probennummern = parseProbennummern(row?.probennummern);
  return values;
}

/**
 * Converts form values into the DB payload: empty text → null, pH parsed with
 * decimal comma support, probennummern JSON-encoded (empty entries dropped).
 */
export function toHorizontData(values: HorizontFormData): HorizontData {
  const data = {} as HorizontData;
  for (const c of TEXT_COLUMNS) data[c] = values[c] || null;
  data.ph_cacl2 = parseDecimal(values.ph_cacl2);
  data.probennummern = JSON.stringify(
    (values.probennummern ?? []).map((p) => p.value).filter(Boolean),
  );
  return data;
}
