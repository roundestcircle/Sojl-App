import db from "./db";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Horizont = {
  id: number;
  aufnahme_id: number;
  nummer: number;
  horizontname: string | null;
  farbe_munsell: string | null;
  bodenart: string | null;
  anteil: string | null;
  notizen: string | null;
  tiefe_oben: string | null;
  tiefe_unten: string | null;
  status: "leer" | "angefangen" | "vollstaendig";
  ph_cacl2: number | null;
  humus: string | null;
  humus_pct: string | null;
  carbonat: string | null;
  packungsdichte: string | null;
  trockenrohdichte: string | null;
  feinwurzeln: string | null;
  gefuege: string | null;
  maechtigk_dm: string | null;
  // Erweiterte fields
  bodenfeuchte: string | null;
  konsistenz: string | null;
  oxidationsmerkmale: string | null;
  reduktionsmerkmale: string | null;
  pedogene_merkmale: string | null;
  lagerungsart_erw: string | null;
  lagerungsform: string | null;
  verfestigungsdichte: string | null;
  hohlraeume: string | null;
  zersetzungsstufe: string | null;
  wurzelverteilung: string | null;
  pilzmycel: string | null;
  grobbodenanbindung: string | null;
  geog_org_kohlenstoff: string | null;
  geogenese: string | null;
  periglaziaere_lagen: string | null;
  stratigraphie: string | null;
  grobkomponenten: string | null;
  feinkomponenten: string | null;
  beimengungen: string | null;
  bes_strukturen: string | null;
  geruch: string | null;
  substratart: string | null;
  probennummern: string | null;
  gpv_pct: string | null;
  gpv_lm2: string | null;
  lk_pct: string | null;
  lk_lm2: string | null;
  fk_pct: string | null;
  fk_lm2: string | null;
  nfk_pct: string | null;
  nfk_lm2: string | null;
  kak: string | null;
  basensaettigung: string | null;
  tonanteil: string | null;
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Appends a new empty Horizont to an Aufnahme, numbered after the current last one. */
export function addHorizont(aufnahmeId: number): void {
  // Single statement so concurrent inserts can't produce duplicate nummern.
  db.runSync(
    `INSERT INTO horizonte (aufnahme_id, nummer, status)
     SELECT ?, COALESCE(MAX(nummer), 0) + 1, 'leer'
       FROM horizonte WHERE aufnahme_id = ?`,
    aufnahmeId,
    aufnahmeId,
  );
}

/**
 * Overrides a Horizont's status by id. Used by ZIP import to restore the exported
 * status exactly (saveHorizont only ever derives 'angefangen'/'vollstaendig', never 'leer').
 */
export function setHorizontStatus(id: number, status: string): void {
  db.runSync(`UPDATE horizonte SET status = ? WHERE id = ?`, status, id);
}

/** Deletes a Horizont by id. */
export function deleteHorizont(id: number): void {
  db.runSync(`DELETE FROM horizonte WHERE id = ?`, id);
}

/**
 * Moves a Horizont one position up or down within its Aufnahme and renumbers all
 * horizons sequentially (1..n) so `nummer` always matches the visual order.
 * No-op if the horizon is already at the top (up) or bottom (down).
 */
export function moveHorizont(
  aufnahmeId: number,
  nummer: number,
  direction: "up" | "down",
): void {
  const horizonte = getHorizonteForAufnahme(aufnahmeId);
  const index = horizonte.findIndex((h) => h.nummer === nummer);
  if (index === -1) return;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= horizonte.length) return;

  // Swap the two rows, then renumber everyone sequentially by stable id so the
  // renumbering can't transiently collide on `nummer`.
  [horizonte[index], horizonte[target]] = [horizonte[target], horizonte[index]];
  db.withTransactionSync(() => {
    horizonte.forEach((h, i) => {
      const newNummer = i + 1;
      if (h.nummer !== newNummer) {
        db.runSync(`UPDATE horizonte SET nummer = ? WHERE id = ?`, newNummer, h.id);
      }
    });
  });
}

/** Returns all Horizonte for a given Aufnahme, ordered by nummer. */
export function getHorizonteForAufnahme(aufnahmeId: number): Horizont[] {
  return db.getAllSync<Horizont>(
    `SELECT * FROM horizonte WHERE aufnahme_id = ? ORDER BY nummer`,
    aufnahmeId,
  );
}

/** Returns a single Horizont by aufnahme_id and nummer. */
export function getHorizont(
  aufnahmeId: number,
  nummer: number,
): Horizont | null {
  return (
    db.getFirstSync<Horizont>(
      `SELECT * FROM horizonte WHERE aufnahme_id = ? AND nummer = ?`,
      aufnahmeId,
      nummer,
    ) ?? null
  );
}

/**
 * Fields that all must be filled for a Horizont to be considered `vollstaendig`.
 * Excludes Erweiterte Bodenaufnahme fields and Automatisch berechnete Werte.
 */
export const HORIZONT_REQUIRED_FOR_VOLLSTAENDIG = [
  "horizontname",
  "tiefe_oben",
  "tiefe_unten",
  "bodenart",
  "anteil",
  "ph_cacl2",
  "farbe_munsell",
  "humus",
  "carbonat",
  "packungsdichte",
  "feinwurzeln",
  "gefuege",
] as const satisfies readonly (keyof Horizont)[];

/**
 * Saves form data for a Horizont and updates its status.
 * Status: vollstaendig if every field in HORIZONT_REQUIRED_FOR_VOLLSTAENDIG is filled, else angefangen.
 */
export function saveHorizont(
  aufnahmeId: number,
  nummer: number,
  data: Partial<
    Pick<
      Horizont,
      | "horizontname"
      | "farbe_munsell"
      | "bodenart"
      | "anteil"
      | "notizen"
      | "tiefe_oben"
      | "tiefe_unten"
      | "ph_cacl2"
      | "humus"
      | "humus_pct"
      | "carbonat"
      | "packungsdichte"
      | "trockenrohdichte"
      | "feinwurzeln"
      | "gefuege"
      | "maechtigk_dm"
      | "bodenfeuchte"
      | "konsistenz"
      | "oxidationsmerkmale"
      | "reduktionsmerkmale"
      | "pedogene_merkmale"
      | "lagerungsart_erw"
      | "lagerungsform"
      | "verfestigungsdichte"
      | "hohlraeume"
      | "zersetzungsstufe"
      | "wurzelverteilung"
      | "pilzmycel"
      | "grobbodenanbindung"
      | "geog_org_kohlenstoff"
      | "geogenese"
      | "periglaziaere_lagen"
      | "stratigraphie"
      | "grobkomponenten"
      | "feinkomponenten"
      | "beimengungen"
      | "bes_strukturen"
      | "geruch"
      | "substratart"
      | "probennummern"
      | "gpv_pct"
      | "gpv_lm2"
      | "lk_pct"
      | "lk_lm2"
      | "fk_pct"
      | "fk_lm2"
      | "nfk_pct"
      | "nfk_lm2"
      | "kak"
      | "basensaettigung"
      | "tonanteil"
    >
  >,
) {
  const isFull = HORIZONT_REQUIRED_FOR_VOLLSTAENDIG.every((f) => {
    const v = data[f];
    return v !== null && v !== undefined && v !== "";
  });
  const status = isFull ? "vollstaendig" : "angefangen";

  db.runSync(
    `UPDATE horizonte
     SET horizontname       = ?,
         farbe_munsell      = ?,
         bodenart           = ?,
         anteil             = ?,
         notizen            = ?,
         tiefe_oben         = ?,
         tiefe_unten        = ?,
         ph_cacl2           = ?,
         humus              = ?,
         humus_pct          = ?,
         carbonat           = ?,
         packungsdichte     = ?,
         trockenrohdichte   = ?,
         feinwurzeln        = ?,
         gefuege            = ?,
         maechtigk_dm       = ?,
         bodenfeuchte       = ?,
         konsistenz         = ?,
         oxidationsmerkmale = ?,
         reduktionsmerkmale = ?,
         pedogene_merkmale  = ?,
         lagerungsart_erw   = ?,
         lagerungsform      = ?,
         verfestigungsdichte = ?,
         hohlraeume         = ?,
         zersetzungsstufe   = ?,
         wurzelverteilung   = ?,
         pilzmycel          = ?,
         grobbodenanbindung = ?,
         geog_org_kohlenstoff = ?,
         geogenese          = ?,
         periglaziaere_lagen = ?,
         stratigraphie      = ?,
         grobkomponenten    = ?,
         feinkomponenten    = ?,
         beimengungen       = ?,
         bes_strukturen     = ?,
         geruch             = ?,
         substratart        = ?,
         probennummern      = ?,
         gpv_pct            = ?,
         gpv_lm2            = ?,
         lk_pct             = ?,
         lk_lm2             = ?,
         fk_pct             = ?,
         fk_lm2             = ?,
         nfk_pct            = ?,
         nfk_lm2            = ?,
         kak                = ?,
         basensaettigung    = ?,
         tonanteil          = ?,
         status             = ?
     WHERE aufnahme_id = ? AND nummer = ?`,
    data.horizontname ?? null,
    data.farbe_munsell ?? null,
    data.bodenart ?? null,
    data.anteil ?? null,
    data.notizen ?? null,
    data.tiefe_oben ?? null,
    data.tiefe_unten ?? null,
    data.ph_cacl2 ?? null,
    data.humus ?? null,
    data.humus_pct ?? null,
    data.carbonat ?? null,
    data.packungsdichte ?? null,
    data.trockenrohdichte ?? null,
    data.feinwurzeln ?? null,
    data.gefuege ?? null,
    data.maechtigk_dm ?? null,
    data.bodenfeuchte ?? null,
    data.konsistenz ?? null,
    data.oxidationsmerkmale ?? null,
    data.reduktionsmerkmale ?? null,
    data.pedogene_merkmale ?? null,
    data.lagerungsart_erw ?? null,
    data.lagerungsform ?? null,
    data.verfestigungsdichte ?? null,
    data.hohlraeume ?? null,
    data.zersetzungsstufe ?? null,
    data.wurzelverteilung ?? null,
    data.pilzmycel ?? null,
    data.grobbodenanbindung ?? null,
    data.geog_org_kohlenstoff ?? null,
    data.geogenese ?? null,
    data.periglaziaere_lagen ?? null,
    data.stratigraphie ?? null,
    data.grobkomponenten ?? null,
    data.feinkomponenten ?? null,
    data.beimengungen ?? null,
    data.bes_strukturen ?? null,
    data.geruch ?? null,
    data.substratart ?? null,
    data.probennummern ?? null,
    data.gpv_pct ?? null,
    data.gpv_lm2 ?? null,
    data.lk_pct ?? null,
    data.lk_lm2 ?? null,
    data.fk_pct ?? null,
    data.fk_lm2 ?? null,
    data.nfk_pct ?? null,
    data.nfk_lm2 ?? null,
    data.kak ?? null,
    data.basensaettigung ?? null,
    data.tonanteil ?? null,
    status,
    aufnahmeId,
    nummer,
  );
}
