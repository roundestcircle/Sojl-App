import type { Horizont } from "@/lib/db/horizontQueries";

// ─── Form shape ────────────────────────────────────────────────────────────────

export type HorizontFormData = {
  horizontname: string;
  farbe_munsell: string;
  bodenart: string;
  anteil: string;
  notizen: string;
  tiefe_oben: string;
  tiefe_unten: string;
  ph_cacl2: string;
  humus: string;
  humus_pct: string;
  carbonat: string;
  packungsdichte: string;
  trockenrohdichte: string;
  feinwurzeln: string;
  gefuege: string;
  maechtigk_dm: string;
  gpv_pct: string;
  gpv_lm2: string;
  lk_pct: string;
  lk_lm2: string;
  fk_pct: string;
  fk_lm2: string;
  nfk_pct: string;
  nfk_lm2: string;
  kak: string;
  basensaettigung: string;
  tonanteil: string;
  // Erweiterte fields
  bodenfeuchte: string;
  konsistenz: string;
  oxidationsmerkmale: string;
  reduktionsmerkmale: string;
  pedogene_merkmale: string;
  lagerungsart_erw: string;
  lagerungsform: string;
  verfestigungsdichte: string;
  hohlraeume: string;
  zersetzungsstufe: string;
  wurzelverteilung: string;
  pilzmycel: string;
  grobbodenanbindung: string;
  geog_org_kohlenstoff: string;
  geogenese: string;
  periglaziaere_lagen: string;
  stratigraphie: string;
  grobkomponenten: string;
  feinkomponenten: string;
  beimengungen: string;
  bes_strukturen: string;
  geruch: string;
  substratart: string;
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

/** String fields that are stored 1:1 from the DB row (everything except pH and probennummern). */
const PLAIN_FIELDS = [
  "horizontname",
  "farbe_munsell",
  "bodenart",
  "anteil",
  "notizen",
  "tiefe_oben",
  "tiefe_unten",
  "humus",
  "humus_pct",
  "carbonat",
  "packungsdichte",
  "trockenrohdichte",
  "feinwurzeln",
  "gefuege",
  "maechtigk_dm",
  "gpv_pct",
  "gpv_lm2",
  "lk_pct",
  "lk_lm2",
  "fk_pct",
  "fk_lm2",
  "nfk_pct",
  "nfk_lm2",
  "kak",
  "basensaettigung",
  "tonanteil",
  "bodenfeuchte",
  "konsistenz",
  "oxidationsmerkmale",
  "reduktionsmerkmale",
  "pedogene_merkmale",
  "lagerungsart_erw",
  "lagerungsform",
  "verfestigungsdichte",
  "hohlraeume",
  "zersetzungsstufe",
  "wurzelverteilung",
  "pilzmycel",
  "grobbodenanbindung",
  "geog_org_kohlenstoff",
  "geogenese",
  "periglaziaere_lagen",
  "stratigraphie",
  "grobkomponenten",
  "feinkomponenten",
  "beimengungen",
  "bes_strukturen",
  "geruch",
  "substratart",
] as const satisfies readonly (keyof HorizontFormData & keyof Horizont)[];

/** Parses the JSON-encoded probennummern column into field-array entries. */
function parseProbennummern(json: string | null | undefined) {
  try {
    return (JSON.parse(json ?? "[]") as string[]).map((v) => ({ value: v }));
  } catch {
    return [];
  }
}

/** Builds react-hook-form default values from a (possibly partial) DB row. */
export function toHorizontFormDefaults(
  initialData?: Partial<Horizont>,
): HorizontFormData {
  const values = {} as HorizontFormData;
  for (const f of PLAIN_FIELDS) {
    values[f] = (initialData?.[f] as string | null | undefined) ?? "";
  }
  values.ph_cacl2 =
    initialData?.ph_cacl2 != null ? String(initialData.ph_cacl2) : "";
  values.probennummern = parseProbennummern(initialData?.probennummern);
  return values;
}
