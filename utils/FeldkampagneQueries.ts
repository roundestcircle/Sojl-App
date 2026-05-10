import db from "./db";
import type { Aufnahme } from "./MappingQueries";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Feldkampagne = {
  id: number;
  name: string;
  erstellt_am: string;
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Creates a new Feldkampagne and returns its id. */
export function createFeldkampagne(name: string): number {
  const result = db.runSync(
    `INSERT INTO feldkampagnen (name) VALUES (?)`,
    name,
  );
  return result.lastInsertRowId;
}

/** Returns all Feldkampagnen, newest first. */
export function getAllFeldkampagnen(): Feldkampagne[] {
  return db.getAllSync<Feldkampagne>(
    `SELECT * FROM feldkampagnen ORDER BY erstellt_am DESC`,
  );
}

/** Returns a single Feldkampagne by id. */
export function getFeldkampagne(id: number): Feldkampagne | null {
  return db.getFirstSync<Feldkampagne>(
    `SELECT * FROM feldkampagnen WHERE id = ?`,
    id,
  ) ?? null;
}

/** Returns all Aufnahmen belonging to a session, newest first. */
export function getAufnahmenForFeldkampagne(sessionId: number): Aufnahme[] {
  return db.getAllSync<Aufnahme>(
    `SELECT * FROM aufnahmen WHERE feldkampagne_id = ? ORDER BY erstellt_am DESC`,
    sessionId,
  );
}

/** Deletes a Feldkampagne and all its Aufnahmen + Horizonte (via CASCADE). */
export function deleteFeldkampagne(id: number) {
  db.runSync(`DELETE FROM feldkampagnen WHERE id = ?`, id);
}
