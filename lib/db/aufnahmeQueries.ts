import db from "@/lib/db/db";
import {
  AUFNAHME_DETAIL_COLUMNS,
  type AufnahmeDetailColumn,
} from "@/lib/db/columns";
import { latLonToUTM } from "@/lib/geo/utmConversion";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Aufnahme = {
  id: number;
  nummer: number | null;
  name: string | null;
  feldkampagne_id: number | null;
  erstellt_am: string;
  gps_lat: number | null;
  gps_lon: number | null;
  utm_easting: number | null;
  utm_northing: number | null;
  utm_zone: string | null;
  notizen: string | null;
  status: "offen" | "abgeschlossen";
  bodentyp: string | null;
  bodtyp_abk: string | null;
  humusform: string | null;
  humsfrm_abk: string | null;
  m_ue_nn: number | null;
  witterung: string | null;
  mittl_n: number | null;
  mittl_temp: number | null;
  nutzung: string | null;
  vegetation: string | null;
  reliefpos: string | null;
  expos: string | null;
  ausgangsgestein: string | null;
  grundigkeit: number | null;
  effektiver_wurzelraum: number | null;
  // Erweiterte fields
  hangneigung: string | null;
  reliefformtyp: string | null;
  mikrorelief: string | null;
  nat_bodenabtrag: string | null;
  kuenstl_bodenabtrag: string | null;
  anthropogene_veraend: string | null;
  bodenoberflaeche: string | null;
  versiegelungsart: string | null;
  regenwuermer: string | null;
  // Profilkennzeichnung fields
  substratsyst_einheit: string | null;
  hydrogeniet_moortyp: string | null;
  durchwurzelbarer_bodenraum: string | null;
  wasserstand_gof: string | null;
  grundnaessestufe: string | null;
  besond_wasserverh: string | null;
  stau_haftnaessestufe: string | null;
  erosionsgrad: string | null;
};

/**
 * Fields that all must be filled for an Aufnahme's Standortdaten to count as `abgeschlossen`.
 * Excludes Erweiterte Bodenaufnahme fields and Automatisch berechnete Werte (grundigkeit,
 * effektiver_wurzelraum). GPS is checked separately by the caller via `hasGps`.
 */
export const STANDORT_REQUIRED_FOR_VOLLSTAENDIG = [
  "bodentyp",
  "humusform",
  "ausgangsgestein",
  "m_ue_nn",
  "reliefpos",
  "expos",
  "nutzung",
  "vegetation",
  "witterung",
  "mittl_n",
  "mittl_temp",
] as const satisfies readonly (keyof Aufnahme)[];

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Inserts an Aufnahme into a Feldkampagne, numbered after the current last one,
 * optionally at a known location. Returns the new aufnahme id.
 */
function insertAufnahme(
  feldkampagneId: number,
  location: { lat: number; lon: number; name: string | null } | null,
): number {
  const utm = location ? latLonToUTM(location.lat, location.lon) : null;
  // Single read-then-insert statement so concurrent callers can't race to
  // produce duplicate nummern within the same Feldkampagne.
  return db.runSync(
    `INSERT INTO aufnahmen
       (status, feldkampagne_id, nummer, name,
        gps_lat, gps_lon, utm_easting, utm_northing, utm_zone)
     SELECT 'offen', ?, COALESCE(MAX(nummer), 0) + 1, ?, ?, ?, ?, ?, ?
       FROM aufnahmen WHERE feldkampagne_id = ?`,
    feldkampagneId,
    location?.name ?? null,
    location?.lat ?? null,
    location?.lon ?? null,
    utm?.easting ?? null,
    utm?.northing ?? null,
    utm?.label ?? null,
    feldkampagneId,
  ).lastInsertRowId;
}

/** Creates a new, empty Aufnahme (without Horizonte) inside a Feldkampagne. Returns its id. */
export function createAufnahme(feldkampagneId: number): number {
  return insertAufnahme(feldkampagneId, null);
}

/**
 * Creates an Aufnahme at a known location (e.g. from a GPX waypoint) with its
 * GPS and derived UTM coordinates and an optional name already filled in.
 * Starts with 0 Horizonte. Returns the new aufnahme id.
 */
export function createAufnahmeAtLocation(
  feldkampagneId: number,
  lat: number,
  lon: number,
  name: string | null,
): number {
  return insertAufnahme(feldkampagneId, { lat, lon, name });
}

/** Returns a single Aufnahme by id. */
export function getAufnahme(id: number): Aufnahme | null {
  return (
    db.getFirstSync<Aufnahme>(`SELECT * FROM aufnahmen WHERE id = ?`, id) ??
    null
  );
}

/** Every editable Standortdaten column of an Aufnahme (see lib/db/columns.ts). */
export type AufnahmeDetails = Pick<Aufnahme, AufnahmeDetailColumn>;

const DETAIL_SET_CLAUSE = AUFNAHME_DETAIL_COLUMNS.map((c) => `${c} = ?`).join(
  ", ",
);

/** Saves all form details for an Aufnahme. */
export function saveAufnahmeDetails(id: number, data: AufnahmeDetails) {
  db.runSync(
    `UPDATE aufnahmen SET ${DETAIL_SET_CLAUSE} WHERE id = ?`,
    ...AUFNAHME_DETAIL_COLUMNS.map((c) => data[c] ?? null),
    id,
  );
}

/**
 * Restores an imported Aufnahme's exported metadata (status, creation timestamp,
 * name and nummer); createAufnahme sets 'offen', now, no name and the next nummer.
 * A null nummer keeps the one assigned on insert.
 */
export function setAufnahmeImportMeta(
  id: number,
  meta: {
    status: Aufnahme["status"];
    erstellt_am: string;
    name: string | null;
    nummer: number | null;
  },
) {
  db.runSync(
    `UPDATE aufnahmen
        SET status = ?, erstellt_am = ?, name = ?, nummer = COALESCE(?, nummer)
      WHERE id = ?`,
    meta.status,
    meta.erstellt_am,
    meta.name,
    meta.nummer,
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
  db.runSync(`UPDATE aufnahmen SET status = 'offen' WHERE id = ?`, aufnahmeId);
}
