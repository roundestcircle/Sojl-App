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
  return (
    db.getFirstSync<Aufnahme>(`SELECT * FROM aufnahmen WHERE id = ?`, id) ??
    null
  );
}

export type AufnahmeDetails = Pick<
  Aufnahme,
  | "gps_lat"
  | "gps_lon"
  | "utm_easting"
  | "utm_northing"
  | "utm_zone"
  | "notizen"
  | "bodentyp"
  | "bodtyp_abk"
  | "humusform"
  | "humsfrm_abk"
  | "m_ue_nn"
  | "witterung"
  | "mittl_n"
  | "mittl_temp"
  | "nutzung"
  | "vegetation"
  | "reliefpos"
  | "expos"
  | "ausgangsgestein"
  | "grundigkeit"
  | "effektiver_wurzelraum"
  | "hangneigung"
  | "reliefformtyp"
  | "mikrorelief"
  | "nat_bodenabtrag"
  | "kuenstl_bodenabtrag"
  | "anthropogene_veraend"
  | "bodenoberflaeche"
  | "versiegelungsart"
  | "regenwuermer"
  | "substratsyst_einheit"
  | "hydrogeniet_moortyp"
  | "durchwurzelbarer_bodenraum"
  | "wasserstand_gof"
  | "grundnaessestufe"
  | "besond_wasserverh"
  | "stau_haftnaessestufe"
  | "erosionsgrad"
>;

/** Saves all form details for an Aufnahme. */
export function saveAufnahmeDetails(id: number, data: AufnahmeDetails) {
  db.runSync(
    `UPDATE aufnahmen SET
       gps_lat = ?, gps_lon = ?, utm_easting = ?, utm_northing = ?, utm_zone = ?,
       notizen = ?, bodentyp = ?, bodtyp_abk = ?, humusform = ?, humsfrm_abk = ?,
       m_ue_nn = ?, witterung = ?, mittl_n = ?, mittl_temp = ?,
       nutzung = ?, vegetation = ?, reliefpos = ?, expos = ?,
       ausgangsgestein = ?, grundigkeit = ?, effektiver_wurzelraum = ?,
       hangneigung = ?, reliefformtyp = ?, mikrorelief = ?,
       nat_bodenabtrag = ?, kuenstl_bodenabtrag = ?,
       anthropogene_veraend = ?, bodenoberflaeche = ?,
       versiegelungsart = ?, regenwuermer = ?,
       substratsyst_einheit = ?, hydrogeniet_moortyp = ?,
       durchwurzelbarer_bodenraum = ?, wasserstand_gof = ?,
       grundnaessestufe = ?, besond_wasserverh = ?,
       stau_haftnaessestufe = ?, erosionsgrad = ?
     WHERE id = ?`,
    data.gps_lat ?? null,
    data.gps_lon ?? null,
    data.utm_easting ?? null,
    data.utm_northing ?? null,
    data.utm_zone ?? null,
    data.notizen ?? null,
    data.bodentyp ?? null,
    data.bodtyp_abk ?? null,
    data.humusform ?? null,
    data.humsfrm_abk ?? null,
    data.m_ue_nn ?? null,
    data.witterung ?? null,
    data.mittl_n ?? null,
    data.mittl_temp ?? null,
    data.nutzung ?? null,
    data.vegetation ?? null,
    data.reliefpos ?? null,
    data.expos ?? null,
    data.ausgangsgestein ?? null,
    data.grundigkeit ?? null,
    data.effektiver_wurzelraum ?? null,
    data.hangneigung ?? null,
    data.reliefformtyp ?? null,
    data.mikrorelief ?? null,
    data.nat_bodenabtrag ?? null,
    data.kuenstl_bodenabtrag ?? null,
    data.anthropogene_veraend ?? null,
    data.bodenoberflaeche ?? null,
    data.versiegelungsart ?? null,
    data.regenwuermer ?? null,
    data.substratsyst_einheit ?? null,
    data.hydrogeniet_moortyp ?? null,
    data.durchwurzelbarer_bodenraum ?? null,
    data.wasserstand_gof ?? null,
    data.grundnaessestufe ?? null,
    data.besond_wasserverh ?? null,
    data.stau_haftnaessestufe ?? null,
    data.erosionsgrad ?? null,
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
