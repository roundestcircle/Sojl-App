import db from "./db";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Horizont = {
  id: number;
  aufnahme_id: number;
  nummer: number;
  horizontname: string | null;
  farbe_munsell: string | null;
  farbe_rgb: string | null;  // stored as JSON string: {"r":0,"g":0,"b":0}
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
  lagerungsart: string | null;
  maechtigk_dm: string | null;
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
export function getHorizont(aufnahmeId: number, nummer: number): Horizont | null {
  return db.getFirstSync<Horizont>(
    `SELECT * FROM horizonte WHERE aufnahme_id = ? AND nummer = ?`,
    aufnahmeId,
    nummer,
  ) ?? null;
}

/**
 * Saves form data for a Horizont and updates its status.
 * Status is derived automatically:
 *   - both farbe_munsell and bodenart filled → 'vollstaendig'
 *   - anything else filled → 'angefangen'
 */
export function saveHorizont(
  aufnahmeId: number,
  nummer: number,
  data: Partial<Pick<Horizont,
    | "horizontname" | "farbe_munsell" | "farbe_rgb" | "bodenart" | "anteil"
    | "notizen" | "tiefe_oben" | "tiefe_unten"
    | "ph_cacl2" | "humus" | "humus_pct" | "carbonat" | "lagerungsdichte"
    | "feinwurzeln" | "lagerungsart" | "maechtigk_dm"
  >>,
) {
  const isFull = data.farbe_munsell && data.bodenart;
  const status = isFull ? "vollstaendig" : "angefangen";

  db.runSync(
    `UPDATE horizonte
     SET horizontname  = ?,
         farbe_munsell = ?,
         farbe_rgb     = ?,
         bodenart      = ?,
         anteil        = ?,
         notizen       = ?,
         tiefe_oben    = ?,
         tiefe_unten   = ?,
         ph_cacl2      = ?,
         humus         = ?,
         humus_pct     = ?,
         carbonat      = ?,
         lagerungsdichte = ?,
         feinwurzeln   = ?,
         lagerungsart  = ?,
         maechtigk_dm  = ?,
         status        = ?
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
    data.lagerungsart ?? null,
    data.maechtigk_dm ?? null,
    status,
    aufnahmeId,
    nummer,
  );
}