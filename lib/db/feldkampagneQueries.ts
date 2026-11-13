import db from "@/lib/db/db";
import type { Aufnahme } from "@/lib/db/aufnahmeQueries";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Feldkampagne = {
  id: number;
  name: string;
  erstellt_am: string;
  status: "offen" | "abgeschlossen";
};

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Creates a new Feldkampagne and returns its id. `meta` restores the status and
 * creation timestamp of an imported campaign; otherwise 'offen' and now are used.
 */
export function createFeldkampagne(
  name: string,
  meta?: { status: Feldkampagne["status"]; erstellt_am: string },
): number {
  if (meta) {
    return db.runSync(
      `INSERT INTO feldkampagnen (name, status, erstellt_am) VALUES (?, ?, ?)`,
      name,
      meta.status,
      meta.erstellt_am,
    ).lastInsertRowId;
  }
  return db.runSync(`INSERT INTO feldkampagnen (name) VALUES (?)`, name)
    .lastInsertRowId;
}

/** Returns all Feldkampagnen, newest first. */
export function getAllFeldkampagnen(): Feldkampagne[] {
  return db.getAllSync<Feldkampagne>(
    `SELECT * FROM feldkampagnen ORDER BY erstellt_am DESC, id DESC`,
  );
}

/** Returns a single Feldkampagne by id. */
export function getFeldkampagne(id: number): Feldkampagne | null {
  return (
    db.getFirstSync<Feldkampagne>(
      `SELECT * FROM feldkampagnen WHERE id = ?`,
      id,
    ) ?? null
  );
}

/** Returns all Aufnahmen belonging to a session, newest first. */
export function getAufnahmenForFeldkampagne(sessionId: number): Aufnahme[] {
  return db.getAllSync<Aufnahme>(
    `SELECT * FROM aufnahmen WHERE feldkampagne_id = ? ORDER BY erstellt_am DESC, id DESC`,
    sessionId,
  );
}

/**
 * Returns all Aufnahmen of a session with their horizon count computed in SQL,
 * avoiding the N+1 round-trips of fetching each Aufnahme's horizons separately.
 */
export function getAufnahmenWithHorizontCount(
  sessionId: number,
): (Aufnahme & { horizontCount: number })[] {
  return db.getAllSync<Aufnahme & { horizontCount: number }>(
    `SELECT a.*,
            (SELECT COUNT(*) FROM horizonte h WHERE h.aufnahme_id = a.id) AS horizontCount
       FROM aufnahmen a
      WHERE a.feldkampagne_id = ?
      ORDER BY a.erstellt_am DESC, a.id DESC`,
    sessionId,
  );
}

/** Sets a Feldkampagne status to 'abgeschlossen'. */
export function closeFeldkampagne(id: number) {
  db.runSync(
    `UPDATE feldkampagnen SET status = 'abgeschlossen' WHERE id = ?`,
    id,
  );
}

/** Deletes a Feldkampagne and all its Aufnahmen + Horizonte (via CASCADE). */
export function deleteFeldkampagne(id: number) {
  db.runSync(`DELETE FROM feldkampagnen WHERE id = ?`, id);
}
