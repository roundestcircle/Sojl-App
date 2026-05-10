import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("bodenaufnahme.db");

/**
 * Initializes the database schema.
 * Call once on app startup (e.g. in _layout.tsx).
 *
 * Tables:
 *   feldkampagnen — one row per field session (contains multiple aufnahmen)
 *   aufnahmen     — one row per soil analysis within a session
 *   horizonte     — one row per horizon within an aufnahme
 */
export function initDatabase() {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS feldkampagnen (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      erstellt_am TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS aufnahmen (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      feldkampagne_id   INTEGER REFERENCES feldkampagnen(id) ON DELETE CASCADE,
      erstellt_am       TEXT    NOT NULL DEFAULT (datetime('now')),
      gps_lat           REAL,
      gps_lon           REAL,
      notizen           TEXT,
      status            TEXT    NOT NULL DEFAULT 'offen'
    );

    CREATE TABLE IF NOT EXISTS horizonte (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      aufnahme_id   INTEGER NOT NULL REFERENCES aufnahmen(id) ON DELETE CASCADE,
      nummer        INTEGER NOT NULL,
      farbe_munsell TEXT,
      farbe_rgb     TEXT,
      bodenart      TEXT,
      anteil        TEXT,
      notizen       TEXT,
      status        TEXT NOT NULL DEFAULT 'leer'
    );
  `);

  // Migration: add feldkampagne_id to existing aufnahmen table if absent
  try {
    db.execSync(`ALTER TABLE aufnahmen ADD COLUMN feldkampagne_id INTEGER`);
  } catch {
    // Column already exists — safe to ignore
  }

  // Migration: add horizontname to existing horizonte table if absent
  try {
    db.execSync(`ALTER TABLE horizonte ADD COLUMN horizontname TEXT`);
  } catch {
    // Column already exists — safe to ignore
  }

  // Migration: add tiefe_oben / tiefe_unten to existing horizonte table if absent
  try {
    db.execSync(`ALTER TABLE horizonte ADD COLUMN tiefe_oben TEXT`);
  } catch {
    // Column already exists — safe to ignore
  }
  try {
    db.execSync(`ALTER TABLE horizonte ADD COLUMN tiefe_unten TEXT`);
  } catch {
    // Column already exists — safe to ignore
  }
}

export default db;
