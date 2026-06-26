import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import Papa from "papaparse";
import JSZip from "jszip";
import db from "./db";
import {
  createFeldkampagne,
} from "./FeldkampagneQueries";
import {
  createAufnahme,
  saveAufnahmeDetails,
  setAufnahmeImportMeta,
  type AufnahmeDetails,
} from "./MappingQueries";
import {
  addHorizont,
  getHorizont,
  saveHorizont,
  setHorizontStatus,
} from "./HorizonQueries";

// ─── Types ────────────────────────────────────────────────────────────────────

/** A parsed CSV row: every column is a string (papaparse with header: true). */
type CSVRow = Record<string, string>;

export type ImportResult = {
  campaignId: number;
  aufnahmen: number;
  horizonte: number;
};

// ─── Value coercion (inverse of csvExport's String()/"" mapping) ────────────────

/** "" / undefined → null, otherwise the numeric value. Mirrors the export's String(num). */
function numOrNull(s: string | undefined): number | null {
  if (s == null || s === "") return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

/** "" / undefined → null, otherwise the trimmed-as-is string. */
function strOrNull(s: string | undefined): string | null {
  if (s == null || s === "") return null;
  return s;
}

// ─── Row → DB-shape mappers ─────────────────────────────────────────────────────

/** Builds the AufnahmeDetails object expected by saveAufnahmeDetails from a CSV row. */
function mapAufnahmeRow(row: CSVRow): AufnahmeDetails {
  return {
    gps_lat: numOrNull(row.gps_lat),
    gps_lon: numOrNull(row.gps_lon),
    utm_easting: numOrNull(row.utm_easting),
    utm_northing: numOrNull(row.utm_northing),
    utm_zone: strOrNull(row.utm_zone),
    notizen: strOrNull(row.notizen),
    bodentyp: strOrNull(row.bodentyp),
    bodtyp_abk: strOrNull(row.bodtyp_abk),
    humusform: strOrNull(row.humusform),
    humsfrm_abk: strOrNull(row.humsfrm_abk),
    m_ue_nn: numOrNull(row.m_ue_nn),
    witterung: strOrNull(row.witterung),
    mittl_n: numOrNull(row.mittl_n),
    mittl_temp: numOrNull(row.mittl_temp),
    nutzung: strOrNull(row.nutzung),
    vegetation: strOrNull(row.vegetation),
    reliefpos: strOrNull(row.reliefpos),
    expos: strOrNull(row.expos),
    ausgangsgestein: strOrNull(row.ausgangsgestein),
    grundigkeit: numOrNull(row.grundigkeit),
    effektiver_wurzelraum: numOrNull(row.effektiver_wurzelraum),
    hangneigung: strOrNull(row.hangneigung),
    reliefformtyp: strOrNull(row.reliefformtyp),
    mikrorelief: strOrNull(row.mikrorelief),
    nat_bodenabtrag: strOrNull(row.nat_bodenabtrag),
    kuenstl_bodenabtrag: strOrNull(row.kuenstl_bodenabtrag),
    anthropogene_veraend: strOrNull(row.anthropogene_veraend),
    bodenoberflaeche: strOrNull(row.bodenoberflaeche),
    versiegelungsart: strOrNull(row.versiegelungsart),
    regenwuermer: strOrNull(row.regenwuermer),
    substratsyst_einheit: strOrNull(row.substratsyst_einheit),
    hydrogeniet_moortyp: strOrNull(row.hydrogeniet_moortyp),
    durchwurzelbarer_bodenraum: strOrNull(row.durchwurzelbarer_bodenraum),
    wasserstand_gof: strOrNull(row.wasserstand_gof),
    grundnaessestufe: strOrNull(row.grundnaessestufe),
    besond_wasserverh: strOrNull(row.besond_wasserverh),
    stau_haftnaessestufe: strOrNull(row.stau_haftnaessestufe),
    erosionsgrad: strOrNull(row.erosionsgrad),
  };
}

/** Builds the data object expected by saveHorizont from a CSV row. */
function mapHorizontRow(row: CSVRow) {
  return {
    horizontname: strOrNull(row.horizontname),
    farbe_munsell: strOrNull(row.farbe_munsell),
    bodenart: strOrNull(row.bodenart),
    anteil: strOrNull(row.anteil),
    notizen: strOrNull(row.notizen),
    tiefe_oben: strOrNull(row.tiefe_oben),
    tiefe_unten: strOrNull(row.tiefe_unten),
    ph_cacl2: numOrNull(row.ph_cacl2),
    humus: strOrNull(row.humus),
    humus_pct: strOrNull(row.humus_pct),
    carbonat: strOrNull(row.carbonat),
    packungsdichte: strOrNull(row.packungsdichte),
    trockenrohdichte: strOrNull(row.trockenrohdichte),
    feinwurzeln: strOrNull(row.feinwurzeln),
    gefuege: strOrNull(row.gefuege),
    maechtigk_dm: strOrNull(row.maechtigk_dm),
    bodenfeuchte: strOrNull(row.bodenfeuchte),
    konsistenz: strOrNull(row.konsistenz),
    oxidationsmerkmale: strOrNull(row.oxidationsmerkmale),
    reduktionsmerkmale: strOrNull(row.reduktionsmerkmale),
    pedogene_merkmale: strOrNull(row.pedogene_merkmale),
    lagerungsart_erw: strOrNull(row.lagerungsart_erw),
    lagerungsform: strOrNull(row.lagerungsform),
    verfestigungsdichte: strOrNull(row.verfestigungsdichte),
    hohlraeume: strOrNull(row.hohlraeume),
    zersetzungsstufe: strOrNull(row.zersetzungsstufe),
    wurzelverteilung: strOrNull(row.wurzelverteilung),
    pilzmycel: strOrNull(row.pilzmycel),
    grobbodenanbindung: strOrNull(row.grobbodenanbindung),
    geog_org_kohlenstoff: strOrNull(row.geog_org_kohlenstoff),
    geogenese: strOrNull(row.geogenese),
    periglaziaere_lagen: strOrNull(row.periglaziaere_lagen),
    stratigraphie: strOrNull(row.stratigraphie),
    grobkomponenten: strOrNull(row.grobkomponenten),
    feinkomponenten: strOrNull(row.feinkomponenten),
    beimengungen: strOrNull(row.beimengungen),
    bes_strukturen: strOrNull(row.bes_strukturen),
    geruch: strOrNull(row.geruch),
    substratart: strOrNull(row.substratart),
    probennummern: strOrNull(row.probennummern),
    gpv_pct: strOrNull(row.gpv_pct),
    gpv_lm2: strOrNull(row.gpv_lm2),
    lk_pct: strOrNull(row.lk_pct),
    lk_lm2: strOrNull(row.lk_lm2),
    fk_pct: strOrNull(row.fk_pct),
    fk_lm2: strOrNull(row.fk_lm2),
    nfk_pct: strOrNull(row.nfk_pct),
    nfk_lm2: strOrNull(row.nfk_lm2),
    kak: strOrNull(row.kak),
    basensaettigung: strOrNull(row.basensaettigung),
    tonanteil: strOrNull(row.tonanteil),
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Derives a campaign name from the picked file name: drops the ".zip" extension
 * and a leading "kampagne_" prefix (added by the exporter). Single-Aufnahme
 * exports ("aufnahme_<id>_<date>.zip") keep their descriptive name.
 */
function campaignNameFromFile(fileName: string): string {
  const base = fileName.replace(/\.zip$/i, "");
  const stripped = base.replace(/^kampagne_/, "");
  return stripped.trim() || base || "Importierte Kampagne";
}

function parseCsv(text: string): CSVRow[] {
  const result = Papa.parse<CSVRow>(text, {
    header: true,
    skipEmptyLines: true,
  });
  return result.data;
}

// ─── Public entry point ─────────────────────────────────────────────────────────

/**
 * Lets the user pick a previously exported ZIP (aufnahmen.csv + horizonte.csv) and
 * reconstructs it as a brand-new Feldkampagne, faithfully restoring every Aufnahme
 * and Horizont (status and erstellt_am preserved). Returns null if the user cancels.
 *
 * The whole reconstruction runs in a single transaction, so a malformed file never
 * leaves a half-imported campaign behind.
 */
export async function pickAndImportCampaignZip(): Promise<ImportResult | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ["application/zip", "application/x-zip-compressed", "*/*"],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (picked.canceled || !picked.assets?.length) return null;
  const asset = picked.assets[0];

  // Read the ZIP bytes and unpack the two CSVs.
  const bytes = await new File(asset.uri).bytes();
  const zip = await JSZip.loadAsync(bytes);
  const aufnahmenEntry = zip.file("aufnahmen.csv");
  const horizonteEntry = zip.file("horizonte.csv");
  if (!aufnahmenEntry || !horizonteEntry) {
    throw new Error(
      "Ungültige Datei: aufnahmen.csv und/oder horizonte.csv fehlt.",
    );
  }

  const aufnahmenRows = parseCsv(await aufnahmenEntry.async("string"));
  const horizonteRows = parseCsv(await horizonteEntry.async("string"));
  if (aufnahmenRows.length === 0) {
    throw new Error("Ungültige Datei: keine Aufnahmen enthalten.");
  }

  const name = campaignNameFromFile(asset.name);
  const campaignId = createFeldkampagne(name);

  let horizonteCount = 0;

  db.withTransactionSync(() => {
    // Map each original aufnahme_id (from the CSV) to its freshly created id.
    const idMap = new Map<string, number>();
    // Tracks the next horizon nummer to expect per new Aufnahme id.
    const horizCounter = new Map<number, number>();

    for (const row of aufnahmenRows) {
      const newId = createAufnahme(0, campaignId);
      saveAufnahmeDetails(newId, mapAufnahmeRow(row));
      setAufnahmeImportMeta(newId, row.status || "offen", row.erstellt_am);
      if (row.aufnahme_id != null) idMap.set(row.aufnahme_id, newId);
    }

    for (const row of horizonteRows) {
      const newAufId = idMap.get(row.aufnahme_id);
      if (newAufId == null) continue; // orphan row → skip

      // addHorizont numbers sequentially per Aufnahme (1..n); track it locally.
      const nummer = (horizCounter.get(newAufId) ?? 0) + 1;
      horizCounter.set(newAufId, nummer);

      addHorizont(newAufId);
      saveHorizont(newAufId, nummer, mapHorizontRow(row));
      if (row.status) {
        const inserted = getHorizont(newAufId, nummer);
        if (inserted) setHorizontStatus(inserted.id, row.status);
      }
      horizonteCount++;
    }
  });

  return {
    campaignId,
    aufnahmen: aufnahmenRows.length,
    horizonte: horizonteCount,
  };
}
