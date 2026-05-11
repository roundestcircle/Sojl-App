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

  // Migration: add UTM columns to aufnahmen if absent
  try {
    db.execSync(`ALTER TABLE aufnahmen ADD COLUMN utm_easting REAL`);
  } catch {}
  try {
    db.execSync(`ALTER TABLE aufnahmen ADD COLUMN utm_northing REAL`);
  } catch {}
  try {
    db.execSync(`ALTER TABLE aufnahmen ADD COLUMN utm_zone TEXT`);
  } catch {}

  // Migration: add campaign-scoped sequence number to aufnahmen
  try {
    db.execSync(`ALTER TABLE aufnahmen ADD COLUMN nummer INTEGER`);
  } catch {}

  // Migration: add profile/site fields to aufnahmen
  for (const col of [
    'ADD COLUMN bodentyp TEXT',
    'ADD COLUMN bodtyp_abk TEXT',
    'ADD COLUMN humusform TEXT',
    'ADD COLUMN humsfrm_abk TEXT',
    'ADD COLUMN m_ue_nn REAL',
    'ADD COLUMN witterung TEXT',
    'ADD COLUMN mittl_n REAL',
    'ADD COLUMN mittl_temp REAL',
    'ADD COLUMN nutzung TEXT',
    'ADD COLUMN vegetation TEXT',
    'ADD COLUMN reliefpos TEXT',
    'ADD COLUMN expos TEXT',
    'ADD COLUMN ausgangsgestein TEXT',
    'ADD COLUMN grundigkeit REAL',
  ]) {
    try { db.execSync(`ALTER TABLE aufnahmen ${col}`); } catch {}
  }

  // Migration: add detailed horizon fields
  for (const col of [
    'ADD COLUMN ph_cacl2 REAL',
    'ADD COLUMN humus TEXT',
    'ADD COLUMN carbonat TEXT',
    'ADD COLUMN pflanzenreste TEXT',
    'ADD COLUMN feinwurzeln TEXT',
    'ADD COLUMN trennbarkeit TEXT',
    'ADD COLUMN lagerungsart TEXT',
    'ADD COLUMN maechtigk_dm TEXT',
  ]) {
    try { db.execSync(`ALTER TABLE horizonte ${col}`); } catch {}
  }
}

export default db;
