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
      erstellt_am TEXT    NOT NULL DEFAULT (datetime('now')),
      status      TEXT    NOT NULL DEFAULT 'offen'
    );

    CREATE TABLE IF NOT EXISTS aufnahmen (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      feldkampagne_id   INTEGER REFERENCES feldkampagnen(id) ON DELETE CASCADE,
      nummer            INTEGER,
      erstellt_am       TEXT    NOT NULL DEFAULT (datetime('now')),
      status            TEXT    NOT NULL DEFAULT 'offen',
      gps_lat           REAL,
      gps_lon           REAL,
      utm_easting       REAL,
      utm_northing      REAL,
      utm_zone          TEXT,
      m_ue_nn           REAL,
      notizen           TEXT,
      bodentyp          TEXT,
      bodtyp_abk        TEXT,
      humusform         TEXT,
      humsfrm_abk       TEXT,
      ausgangsgestein   TEXT,
      grundigkeit       REAL,
      witterung         TEXT,
      mittl_n           REAL,
      mittl_temp        REAL,
      nutzung           TEXT,
      vegetation        TEXT,
      reliefpos         TEXT,
      expos             TEXT,
      hangneigung       TEXT,
      reliefformtyp     TEXT,
      mikrorelief       TEXT,
      nat_bodenabtrag   TEXT,
      kuenstl_bodenabtrag TEXT,
      anthropogene_veraend TEXT,
      bodenoberflaeche  TEXT,
      versiegelungsart  TEXT,
      regenwuermer      TEXT,
      substratsyst_einheit       TEXT,
      hydrogeniet_moortyp        TEXT,
      durchwurzelbarer_bodenraum TEXT,
      wasserstand_gof            TEXT,
      grundnaessestufe           TEXT,
      besond_wasserverh          TEXT,
      stau_haftnaessestufe       TEXT,
      erosionsgrad               TEXT
    );

    CREATE TABLE IF NOT EXISTS horizonte (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      aufnahme_id   INTEGER NOT NULL REFERENCES aufnahmen(id) ON DELETE CASCADE,
      nummer        INTEGER NOT NULL,
      status        TEXT    NOT NULL DEFAULT 'leer',
      horizontname  TEXT,
      tiefe_oben    TEXT,
      tiefe_unten   TEXT,
      maechtigk_dm  TEXT,
      farbe_munsell TEXT,
      farbe_rgb     TEXT,
      bodenart      TEXT,
      anteil        TEXT,
      ph_cacl2      REAL,
      humus         TEXT,
      humus_pct     TEXT,
      carbonat      TEXT,
      lagerungsdichte TEXT,
      feinwurzeln   TEXT,
      gefuege       TEXT,
      notizen       TEXT,
      bodenfeuchte         TEXT,
      konsistenz           TEXT,
      oxidationsmerkmale   TEXT,
      reduktionsmerkmale   TEXT,
      pedogene_merkmale    TEXT,
      lagerungsart_erw     TEXT,
      lagerungsform        TEXT,
      verfestigungsdichte  TEXT,
      hohlraeume           TEXT,
      zersetzungsstufe     TEXT,
      wurzelverteilung     TEXT,
      pilzmycel            TEXT,
      grobbodenanbindung   TEXT,
      geog_org_kohlenstoff TEXT,
      geogenese            TEXT,
      periglaziaere_lagen  TEXT,
      stratigraphie        TEXT,
      grobkomponenten      TEXT,
      feinkomponenten      TEXT,
      beimengungen         TEXT,
      bes_strukturen       TEXT,
      geruch               TEXT,
      substratart          TEXT,
      probennummern        TEXT
    );
  `);

  for (const col of [
    "gpv_pct",
    "gpv_lm2",
    "lk_pct",
    "lk_lm2",
    "fk_pct",
    "fk_lm2",
    "nfk_pct",
    "nfk_lm2",
  ]) {
    try {
      db.execSync(`ALTER TABLE horizonte ADD COLUMN ${col} TEXT`);
    } catch (_) {}
  }
  try {
    db.execSync(`ALTER TABLE aufnahmen ADD COLUMN effektiver_wurzelraum REAL`);
  } catch (_) {}
  try {
    db.execSync(`ALTER TABLE horizonte ADD COLUMN kak TEXT`);
  } catch (_) {}
  try {
    db.execSync(`ALTER TABLE horizonte ADD COLUMN basensaettigung TEXT`);
  } catch (_) {}
}

export default db;
