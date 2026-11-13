import * as SQLite from "expo-sqlite";
import {
  AUFNAHME_DETAIL_COLUMNS,
  AUFNAHME_REAL_COLUMNS,
  HORIZONT_DATA_COLUMNS,
  HORIZONT_REAL_COLUMNS,
} from "@/lib/db/columns";

/**
 * SQLite database `bodenaufnahme.db`. The schema is created/migrated when this
 * module is first imported, so every query module can rely on it — even
 * screens that render before the root layout's effects run (deep links).
 *
 * Tables:
 *   feldkampagnen — one row per field session (contains multiple aufnahmen)
 *   aufnahmen     — one row per soil analysis within a session
 *   horizonte     — one row per horizon within an aufnahme
 */
const db = SQLite.openDatabaseSync("bodenaufnahme.db");

function initDatabase() {
  // foreign_keys is per connection and off by default in SQLite; without it the
  // ON DELETE CASCADE clauses below do nothing.
  db.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS feldkampagnen (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      erstellt_am TEXT    NOT NULL DEFAULT (datetime('now')),
      status      TEXT    NOT NULL DEFAULT 'offen'
    );

    CREATE TABLE IF NOT EXISTS aufnahmen (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      feldkampagne_id   INTEGER REFERENCES feldkampagnen(id) ON DELETE CASCADE,
      nummer            INTEGER,
      name              TEXT,
      erstellt_am       TEXT    NOT NULL DEFAULT (datetime('now')),
      status            TEXT    NOT NULL DEFAULT 'offen'
    );

    CREATE TABLE IF NOT EXISTS horizonte (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      aufnahme_id   INTEGER NOT NULL REFERENCES aufnahmen(id) ON DELETE CASCADE,
      nummer        INTEGER NOT NULL,
      status        TEXT    NOT NULL DEFAULT 'leer'
    );

    CREATE INDEX IF NOT EXISTS idx_aufnahmen_kampagne ON aufnahmen(feldkampagne_id);
    CREATE INDEX IF NOT EXISTS idx_horizonte_aufnahme ON horizonte(aufnahme_id);
  `);

  // Data columns come from lib/db/columns.ts. Missing ones are added, which
  // both builds fresh installs and migrates older ones (additive only).
  addMissingColumns(
    "aufnahmen",
    ["name", ...AUFNAHME_DETAIL_COLUMNS],
    AUFNAHME_REAL_COLUMNS,
  );
  addMissingColumns("horizonte", HORIZONT_DATA_COLUMNS, HORIZONT_REAL_COLUMNS);

  // Obsolete column replaced by packungsdichte/trockenrohdichte. Throws once it
  // is gone (or on SQLite builds without DROP COLUMN), hence the try/catch.
  try {
    db.execSync(`ALTER TABLE horizonte DROP COLUMN lagerungsdichte;`);
  } catch {}
}

/** Adds every column of `columns` that `table` does not have yet. */
function addMissingColumns(
  table: string,
  columns: readonly string[],
  realColumns: ReadonlySet<string>,
) {
  const existing = new Set(
    db
      .getAllSync<{ name: string }>(`PRAGMA table_info(${table})`)
      .map((c) => c.name),
  );
  for (const col of columns) {
    if (existing.has(col)) continue;
    const type = realColumns.has(col) ? "REAL" : "TEXT";
    db.execSync(`ALTER TABLE ${table} ADD COLUMN ${col} ${type};`);
  }
}

initDatabase();

export default db;
