import db from "./db";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Horizont = {
  id: number;
  aufnahme_id: number;
  nummer: number;
  horizontname: string | null;
  farbe_munsell: string | null;
  farbe_rgb: string | null;
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
  lagerungsdichte: string | null;
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
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Appends a new empty Horizont to an Aufnahme, numbered after the current last one. */
export function addHorizont(aufnahmeId: number): void {
  const row = db.getFirstSync<{ max_nummer: number | null }>(
    `SELECT MAX(nummer) as max_nummer FROM horizonte WHERE aufnahme_id = ?`,
    aufnahmeId,
  );
  const nextNummer = (row?.max_nummer ?? 0) + 1;
  db.runSync(
    `INSERT INTO horizonte (aufnahme_id, nummer, status) VALUES (?, ?, 'leer')`,
    aufnahmeId,
    nextNummer,
  );
}

/** Deletes a Horizont by id. */
export function deleteHorizont(id: number): void {
  db.runSync(`DELETE FROM horizonte WHERE id = ?`, id);
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
 * Saves form data for a Horizont and updates its status.
 * Status: vollstaendig if farbe_munsell + bodenart both filled, else angefangen.
 */
export function saveHorizont(
  aufnahmeId: number,
  nummer: number,
  data: Partial<
    Pick<
      Horizont,
      | "horizontname"
      | "farbe_munsell"
      | "farbe_rgb"
      | "bodenart"
      | "anteil"
      | "notizen"
      | "tiefe_oben"
      | "tiefe_unten"
      | "ph_cacl2"
      | "humus"
      | "humus_pct"
      | "carbonat"
      | "lagerungsdichte"
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
    >
  >,
) {
  const isFull = data.farbe_munsell && data.bodenart;
  const status = isFull ? "vollstaendig" : "angefangen";

  db.runSync(
    `UPDATE horizonte
     SET horizontname       = ?,
         farbe_munsell      = ?,
         farbe_rgb          = ?,
         bodenart           = ?,
         anteil             = ?,
         notizen            = ?,
         tiefe_oben         = ?,
         tiefe_unten        = ?,
         ph_cacl2           = ?,
         humus              = ?,
         humus_pct          = ?,
         carbonat           = ?,
         lagerungsdichte    = ?,
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
         status             = ?
     WHERE aufnahme_id = ? AND nummer = ?`,
    data.horizontname ?? null,
    data.farbe_munsell ?? null,
    data.farbe_rgb ?? null,
    data.bodenart ?? null,
    data.anteil ?? null,
    data.notizen ?? null,
    data.tiefe_oben ?? null,
    data.tiefe_unten ?? null,
    data.ph_cacl2 ?? null,
    data.humus ?? null,
    data.humus_pct ?? null,
    data.carbonat ?? null,
    data.lagerungsdichte ?? null,
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
    status,
    aufnahmeId,
    nummer,
  );
}
