/**
 * Single source of truth for the data columns of `aufnahmen` and `horizonte`.
 *
 * DB updates (`saveAufnahmeDetails`, `saveHorizont`), the schema migration in
 * db.ts, CSV export and ZIP import are all built from these lists, so a new
 * column only has to be added here (plus the row type and the form).
 *
 * Columns listed in the *_REAL_COLUMNS sets are stored as REAL, all others as TEXT.
 */
import type { Aufnahme } from "@/lib/db/aufnahmeQueries";
import type { Horizont } from "@/lib/db/horizontQueries";

/** Editable Standortdaten columns of `aufnahmen` (everything the form saves). */
export const AUFNAHME_DETAIL_COLUMNS = [
  "gps_lat",
  "gps_lon",
  "utm_easting",
  "utm_northing",
  "utm_zone",
  "m_ue_nn",
  "bodentyp",
  "bodtyp_abk",
  "humusform",
  "humsfrm_abk",
  "ausgangsgestein",
  "grundigkeit",
  "effektiver_wurzelraum",
  "reliefpos",
  "expos",
  "hangneigung",
  "reliefformtyp",
  "mikrorelief",
  "nutzung",
  "vegetation",
  "witterung",
  "mittl_n",
  "mittl_temp",
  "nat_bodenabtrag",
  "kuenstl_bodenabtrag",
  "anthropogene_veraend",
  "erosionsgrad",
  "bodenoberflaeche",
  "versiegelungsart",
  "regenwuermer",
  "substratsyst_einheit",
  "hydrogeniet_moortyp",
  "durchwurzelbarer_bodenraum",
  "wasserstand_gof",
  "grundnaessestufe",
  "besond_wasserverh",
  "stau_haftnaessestufe",
  "notizen",
] as const satisfies readonly (keyof Aufnahme)[];

export type AufnahmeDetailColumn = (typeof AUFNAHME_DETAIL_COLUMNS)[number];

export const AUFNAHME_REAL_COLUMNS: ReadonlySet<string> = new Set<
  keyof Aufnahme
>([
  "gps_lat",
  "gps_lon",
  "utm_easting",
  "utm_northing",
  "m_ue_nn",
  "grundigkeit",
  "effektiver_wurzelraum",
  "mittl_n",
  "mittl_temp",
]);

/**
 * Data columns of `horizonte` (everything except id, aufnahme_id, nummer, status),
 * in export order.
 */
export const HORIZONT_DATA_COLUMNS = [
  "horizontname",
  "tiefe_oben",
  "tiefe_unten",
  "maechtigk_dm",
  "farbe_munsell",
  "bodenart",
  "tonanteil",
  "anteil",
  "ph_cacl2",
  "humus",
  "humus_pct",
  "carbonat",
  "packungsdichte",
  "trockenrohdichte",
  "feinwurzeln",
  "gefuege",
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
  "notizen",
  "probennummern",
] as const satisfies readonly (keyof Horizont)[];

export type HorizontDataColumn = (typeof HORIZONT_DATA_COLUMNS)[number];

export const HORIZONT_REAL_COLUMNS: ReadonlySet<string> = new Set<
  keyof Horizont
>(["ph_cacl2"]);
