import db from "./db";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Aufnahme = {
  id: number;
  feldkampagne_id: number | null;
  erstellt_am: string;
  gps_lat: number | null;
  gps_lon: number | null;
  notizen: string | null;
  status: "offen" | "abgeschlossen";
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Creates a new Aufnahme inside a Feldkampagne and inserts n empty Horizonte.
 * Returns the new aufnahme id.
 */
export function createAufnahme(
  anzahlHorizonte: number,
  feldkampagneId: number,
): number {
  const result = db.runSync(
    `INSERT INTO aufnahmen (status, feldkampagne_id) VALUES ('offen', ?)`,
    feldkampagneId,
  );
  const aufnahmeId = result.lastInsertRowId;

  for (let i = 1; i <= anzahlHorizonte; i++) {
    db.runSync(
      `INSERT INTO horizonte (aufnahme_id, nummer, status) VALUES (?, ?, 'leer')`,
      aufnahmeId,
      i,
    );
  }

  return aufnahmeId;
}

/** Returns a single Aufnahme by id. */
export function getAufnahme(id: number): Aufnahme | null {
  return db.getFirstSync<Aufnahme>(
    `SELECT * FROM aufnahmen WHERE id = ?`,
    id,
  ) ?? null;
}

/** Saves location details (GPS + notes) for an Aufnahme. */
export function saveAufnahmeDetails(
  id: number,
  data: Pick<Aufnahme, "gps_lat" | "gps_lon" | "notizen">,
) {
  db.runSync(
    `UPDATE aufnahmen SET gps_lat = ?, gps_lon = ?, notizen = ? WHERE id = ?`,
    data.gps_lat ?? null,
    data.gps_lon ?? null,
    data.notizen ?? null,
    id,
  );
}

/** Marks an Aufnahme as abgeschlossen. */
export function closeAufnahme(aufnahmeId: number) {
  db.runSync(
    `UPDATE aufnahmen SET status = 'abgeschlossen' WHERE id = ?`,
    aufnahmeId,
  );
}

/** Marks an Aufnahme as offen again to allow re-editing. */
export function reopenAufnahme(aufnahmeId: number) {
  db.runSync(
    `UPDATE aufnahmen SET status = 'offen' WHERE id = ?`,
    aufnahmeId,
  );
}
