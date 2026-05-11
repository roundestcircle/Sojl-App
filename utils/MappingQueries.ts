import db from "./db";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Aufnahme = {
  id: number;
  nummer: number | null;
  feldkampagne_id: number | null;
  erstellt_am: string;
  gps_lat: number | null;
  gps_lon: number | null;
  utm_easting: number | null;
  utm_northing: number | null;
  utm_zone: string | null;
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
  const row = db.getFirstSync<{ max_nummer: number | null }>(
    `SELECT MAX(nummer) as max_nummer FROM aufnahmen WHERE feldkampagne_id = ?`,
    feldkampagneId,
  );
  const nextNummer = (row?.max_nummer ?? 0) + 1;
  const result = db.runSync(
    `INSERT INTO aufnahmen (status, feldkampagne_id, nummer) VALUES ('offen', ?, ?)`,
    feldkampagneId,
    nextNummer,
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

export type AufnahmeDetails = Pick<Aufnahme, "gps_lat" | "gps_lon" | "utm_easting" | "utm_northing" | "utm_zone" | "notizen">;

/** Saves location details (GPS + notes) for an Aufnahme. */
export function saveAufnahmeDetails(id: number, data: AufnahmeDetails) {
  db.runSync(
    `UPDATE aufnahmen SET gps_lat = ?, gps_lon = ?, utm_easting = ?, utm_northing = ?, utm_zone = ?, notizen = ? WHERE id = ?`,
    data.gps_lat ?? null,
    data.gps_lon ?? null,
    data.utm_easting ?? null,
    data.utm_northing ?? null,
    data.utm_zone ?? null,
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

/** Deletes an Aufnahme and its Horizonte (via CASCADE). */
export function deleteAufnahme(id: number) {
  db.runSync(`DELETE FROM aufnahmen WHERE id = ?`, id);
}

/** Marks an Aufnahme as offen again to allow re-editing. */
export function reopenAufnahme(aufnahmeId: number) {
  db.runSync(
    `UPDATE aufnahmen SET status = 'offen' WHERE id = ?`,
    aufnahmeId,
  );
}
