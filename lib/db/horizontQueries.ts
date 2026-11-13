import db from "@/lib/db/db";
import {
  HORIZONT_DATA_COLUMNS,
  type HorizontDataColumn,
} from "@/lib/db/columns";

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

/** Every stored data column of a Horizont (see lib/db/columns.ts). */
export type HorizontData = Pick<Horizont, HorizontDataColumn>;

export type HorizontStatus = Horizont["status"];

// ─── Status ───────────────────────────────────────────────────────────────────

/**
 * Fields that all must be filled for a Horizont to be considered `vollstaendig`.
 * Only user-entered fields: derived values (Humusklasse, TRD, …) depend on these
 * and would otherwise block completion when an input is "nb".
 */
export const HORIZONT_REQUIRED_FOR_VOLLSTAENDIG = [
  "horizontname",
  "tiefe_oben",
  "tiefe_unten",
  "bodenart",
  "tonanteil",
  "anteil",
  "ph_cacl2",
  "farbe_munsell",
  "carbonat",
  "packungsdichte",
  "feinwurzeln",
  "gefuege",
] as const satisfies readonly HorizontDataColumn[];

/** Automatically calculated columns; they never count as user input. */
const DERIVED_COLUMNS: ReadonlySet<HorizontDataColumn> = new Set([
  "maechtigk_dm",
  "humus",
  "humus_pct",
  "trockenrohdichte",
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
] as const);

function isFilled(v: unknown): boolean {
  return v !== null && v !== undefined && v !== "" && v !== "[]";
}

/**
 * Derives the Horizont status from its data: `leer` when no user field is
 * filled, `vollstaendig` when every required field is filled ("nb" counts as
 * filled), otherwise `angefangen`.
 */
export function horizontStatus(data: Partial<HorizontData>): HorizontStatus {
  if (HORIZONT_REQUIRED_FOR_VOLLSTAENDIG.every((f) => isFilled(data[f]))) {
    return "vollstaendig";
  }
  const anyInput = HORIZONT_DATA_COLUMNS.some(
    (c) => !DERIVED_COLUMNS.has(c) && isFilled(data[c]),
  );
  return anyInput ? "angefangen" : "leer";
}

// ─── Queries ──────────────────────────────────────────────────────────────────

const SET_CLAUSE = HORIZONT_DATA_COLUMNS.map((c) => `${c} = ?`).join(", ");
const bindValues = (data: Partial<HorizontData>) =>
  HORIZONT_DATA_COLUMNS.map((c) => data[c] ?? null);

/**
 * Appends a new empty Horizont to an Aufnahme, numbered after the current last
 * one. Returns the new row id.
 */
export function addHorizont(aufnahmeId: number): number {
  // Single statement so concurrent inserts can't produce duplicate nummern.
  return db.runSync(
    `INSERT INTO horizonte (aufnahme_id, nummer, status)
     SELECT ?, COALESCE(MAX(nummer), 0) + 1, 'leer'
       FROM horizonte WHERE aufnahme_id = ?`,
    aufnahmeId,
    aufnahmeId,
  ).lastInsertRowId;
}

/**
 * Inserts a complete Horizont with an explicit nummer and status (ZIP import,
 * which restores the exported state exactly). Returns the new row id.
 */
export function insertHorizont(
  aufnahmeId: number,
  nummer: number,
  status: HorizontStatus,
  data: Partial<HorizontData>,
): number {
  const cols = HORIZONT_DATA_COLUMNS.join(", ");
  const marks = HORIZONT_DATA_COLUMNS.map(() => "?").join(", ");
  return db.runSync(
    `INSERT INTO horizonte (aufnahme_id, nummer, status, ${cols})
     VALUES (?, ?, ?, ${marks})`,
    aufnahmeId,
    nummer,
    status,
    ...bindValues(data),
  ).lastInsertRowId;
}

/**
 * Deletes a Horizont and closes the gap in the numbering of the following ones,
 * so `nummer` always runs 1..n in visual order.
 */
export function deleteHorizont(id: number): void {
  db.withTransactionSync(() => {
    const row = db.getFirstSync<{ aufnahme_id: number; nummer: number }>(
      `SELECT aufnahme_id, nummer FROM horizonte WHERE id = ?`,
      id,
    );
    if (!row) return;
    db.runSync(`DELETE FROM horizonte WHERE id = ?`, id);
    db.runSync(
      `UPDATE horizonte SET nummer = nummer - 1
        WHERE aufnahme_id = ? AND nummer > ?`,
      row.aufnahme_id,
      row.nummer,
    );
  });
}

/**
 * Moves a Horizont one position up or down within its Aufnahme and renumbers all
 * horizons sequentially (1..n) so `nummer` always matches the visual order (this
 * also repairs gaps left by older app versions).
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

  [horizonte[index], horizonte[target]] = [horizonte[target], horizonte[index]];
  db.withTransactionSync(() => {
    horizonte.forEach((h, i) => {
      if (h.nummer !== i + 1) {
        db.runSync(`UPDATE horizonte SET nummer = ? WHERE id = ?`, i + 1, h.id);
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

/** Saves all data columns of a Horizont and re-derives its status. */
export function saveHorizont(
  aufnahmeId: number,
  nummer: number,
  data: Partial<HorizontData>,
) {
  db.runSync(
    `UPDATE horizonte SET ${SET_CLAUSE}, status = ?
      WHERE aufnahme_id = ? AND nummer = ?`,
    ...bindValues(data),
    horizontStatus(data),
    aufnahmeId,
    nummer,
  );
}

/** Updates only the stored KAK of a Horizont (after the Aufnahme's Humusform changed). */
export function setHorizontKak(id: number, kak: string | null): void {
  db.runSync(`UPDATE horizonte SET kak = ? WHERE id = ?`, kak, id);
}
