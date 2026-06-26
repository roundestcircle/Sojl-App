import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import Papa from "papaparse";
import JSZip from "jszip";
import { getHorizonteForAufnahme } from "./HorizonQueries";
import { getAufnahmenForFeldkampagne } from "./FeldkampagneQueries";
import type { Aufnahme } from "./MappingQueries";

// ─── Types ────────────────────────────────────────────────────────────────────

type AufnahmeCSVRow = {
  aufnahme_id: number;
  name: string;
  erstellt_am: string;
  status: string;
  gps_lat: string;
  gps_lon: string;
  utm_easting: string;
  utm_northing: string;
  utm_zone: string;
  m_ue_nn: string;
  bodentyp: string;
  bodtyp_abk: string;
  humusform: string;
  humsfrm_abk: string;
  ausgangsgestein: string;
  grundigkeit: string;
  effektiver_wurzelraum: string;
  reliefpos: string;
  expos: string;
  hangneigung: string;
  reliefformtyp: string;
  mikrorelief: string;
  nutzung: string;
  vegetation: string;
  witterung: string;
  mittl_n: string;
  mittl_temp: string;
  nat_bodenabtrag: string;
  kuenstl_bodenabtrag: string;
  anthropogene_veraend: string;
  erosionsgrad: string;
  bodenoberflaeche: string;
  versiegelungsart: string;
  regenwuermer: string;
  substratsyst_einheit: string;
  hydrogeniet_moortyp: string;
  durchwurzelbarer_bodenraum: string;
  wasserstand_gof: string;
  grundnaessestufe: string;
  besond_wasserverh: string;
  stau_haftnaessestufe: string;
  notizen: string;
};

type HorizontCSVRow = {
  aufnahme_id: number;
  horizont_nr: number;
  status: string;
  horizontname: string;
  tiefe_oben: string;
  tiefe_unten: string;
  maechtigk_dm: string;
  farbe_munsell: string;
  bodenart: string;
  tonanteil: string;
  anteil: string;
  ph_cacl2: string;
  humus: string;
  humus_pct: string;
  carbonat: string;
  packungsdichte: string;
  trockenrohdichte: string;
  feinwurzeln: string;
  gefuege: string;
  bodenfeuchte: string;
  konsistenz: string;
  oxidationsmerkmale: string;
  reduktionsmerkmale: string;
  pedogene_merkmale: string;
  lagerungsart_erw: string;
  lagerungsform: string;
  verfestigungsdichte: string;
  hohlraeume: string;
  zersetzungsstufe: string;
  wurzelverteilung: string;
  pilzmycel: string;
  grobbodenanbindung: string;
  geog_org_kohlenstoff: string;
  geogenese: string;
  periglaziaere_lagen: string;
  stratigraphie: string;
  grobkomponenten: string;
  feinkomponenten: string;
  beimengungen: string;
  bes_strukturen: string;
  geruch: string;
  substratart: string;
  gpv_pct: string;
  gpv_lm2: string;
  lk_pct: string;
  lk_lm2: string;
  fk_pct: string;
  fk_lm2: string;
  nfk_pct: string;
  nfk_lm2: string;
  kak: string;
  basensaettigung: string;
  notizen: string;
  probennummern: string;
};

// ─── Shared internals ─────────────────────────────────────────────────────────

function buildRows(aufnahmen: Aufnahme[]): {
  aufnahmenRows: AufnahmeCSVRow[];
  horizonteRows: HorizontCSVRow[];
} {
  const aufnahmenRows: AufnahmeCSVRow[] = aufnahmen.map((a) => ({
    aufnahme_id: a.id,
    name: a.name ?? "",
    erstellt_am: a.erstellt_am,
    status: a.status,
    gps_lat: a.gps_lat != null ? String(a.gps_lat) : "",
    gps_lon: a.gps_lon != null ? String(a.gps_lon) : "",
    utm_easting: a.utm_easting != null ? String(a.utm_easting) : "",
    utm_northing: a.utm_northing != null ? String(a.utm_northing) : "",
    utm_zone: a.utm_zone ?? "",
    m_ue_nn: a.m_ue_nn != null ? String(a.m_ue_nn) : "",
    bodentyp: a.bodentyp ?? "",
    bodtyp_abk: a.bodtyp_abk ?? "",
    humusform: a.humusform ?? "",
    humsfrm_abk: a.humsfrm_abk ?? "",
    ausgangsgestein: a.ausgangsgestein ?? "",
    grundigkeit: a.grundigkeit != null ? String(a.grundigkeit) : "",
    effektiver_wurzelraum:
      a.effektiver_wurzelraum != null ? String(a.effektiver_wurzelraum) : "",
    reliefpos: a.reliefpos ?? "",
    expos: a.expos ?? "",
    hangneigung: a.hangneigung ?? "",
    reliefformtyp: a.reliefformtyp ?? "",
    mikrorelief: a.mikrorelief ?? "",
    nutzung: a.nutzung ?? "",
    vegetation: a.vegetation ?? "",
    witterung: a.witterung ?? "",
    mittl_n: a.mittl_n != null ? String(a.mittl_n) : "",
    mittl_temp: a.mittl_temp != null ? String(a.mittl_temp) : "",
    nat_bodenabtrag: a.nat_bodenabtrag ?? "",
    kuenstl_bodenabtrag: a.kuenstl_bodenabtrag ?? "",
    anthropogene_veraend: a.anthropogene_veraend ?? "",
    erosionsgrad: a.erosionsgrad ?? "",
    bodenoberflaeche: a.bodenoberflaeche ?? "",
    versiegelungsart: a.versiegelungsart ?? "",
    regenwuermer: a.regenwuermer ?? "",
    substratsyst_einheit: a.substratsyst_einheit ?? "",
    hydrogeniet_moortyp: a.hydrogeniet_moortyp ?? "",
    durchwurzelbarer_bodenraum: a.durchwurzelbarer_bodenraum ?? "",
    wasserstand_gof: a.wasserstand_gof ?? "",
    grundnaessestufe: a.grundnaessestufe ?? "",
    besond_wasserverh: a.besond_wasserverh ?? "",
    stau_haftnaessestufe: a.stau_haftnaessestufe ?? "",
    notizen: a.notizen ?? "",
  }));

  const horizonteRows: HorizontCSVRow[] = [];
  for (const aufnahme of aufnahmen) {
    for (const h of getHorizonteForAufnahme(aufnahme.id)) {
      horizonteRows.push({
        aufnahme_id: aufnahme.id,
        horizont_nr: h.nummer,
        status: h.status,
        horizontname: h.horizontname ?? "",
        tiefe_oben: h.tiefe_oben ?? "",
        tiefe_unten: h.tiefe_unten ?? "",
        maechtigk_dm: h.maechtigk_dm ?? "",
        farbe_munsell: h.farbe_munsell ?? "",
        bodenart: h.bodenart ?? "",
        tonanteil: h.tonanteil ?? "",
        anteil: h.anteil ?? "",
        ph_cacl2: h.ph_cacl2 != null ? String(h.ph_cacl2) : "",
        humus: h.humus ?? "",
        humus_pct: h.humus_pct ?? "",
        carbonat: h.carbonat ?? "",
        packungsdichte: h.packungsdichte ?? "",
        trockenrohdichte: h.trockenrohdichte ?? "",
        feinwurzeln: h.feinwurzeln ?? "",
        gefuege: h.gefuege ?? "",
        bodenfeuchte: h.bodenfeuchte ?? "",
        konsistenz: h.konsistenz ?? "",
        oxidationsmerkmale: h.oxidationsmerkmale ?? "",
        reduktionsmerkmale: h.reduktionsmerkmale ?? "",
        pedogene_merkmale: h.pedogene_merkmale ?? "",
        lagerungsart_erw: h.lagerungsart_erw ?? "",
        lagerungsform: h.lagerungsform ?? "",
        verfestigungsdichte: h.verfestigungsdichte ?? "",
        hohlraeume: h.hohlraeume ?? "",
        zersetzungsstufe: h.zersetzungsstufe ?? "",
        wurzelverteilung: h.wurzelverteilung ?? "",
        pilzmycel: h.pilzmycel ?? "",
        grobbodenanbindung: h.grobbodenanbindung ?? "",
        geog_org_kohlenstoff: h.geog_org_kohlenstoff ?? "",
        geogenese: h.geogenese ?? "",
        periglaziaere_lagen: h.periglaziaere_lagen ?? "",
        stratigraphie: h.stratigraphie ?? "",
        grobkomponenten: h.grobkomponenten ?? "",
        feinkomponenten: h.feinkomponenten ?? "",
        beimengungen: h.beimengungen ?? "",
        bes_strukturen: h.bes_strukturen ?? "",
        geruch: h.geruch ?? "",
        substratart: h.substratart ?? "",
        gpv_pct: h.gpv_pct ?? "",
        gpv_lm2: h.gpv_lm2 ?? "",
        lk_pct: h.lk_pct ?? "",
        lk_lm2: h.lk_lm2 ?? "",
        fk_pct: h.fk_pct ?? "",
        fk_lm2: h.fk_lm2 ?? "",
        nfk_pct: h.nfk_pct ?? "",
        nfk_lm2: h.nfk_lm2 ?? "",
        kak: h.kak ?? "",
        basensaettigung: h.basensaettigung ?? "",
        notizen: h.notizen ?? "",
        probennummern: h.probennummern ?? "",
      });
    }
  }

  return { aufnahmenRows, horizonteRows };
}

async function buildAndShareZip(
  aufnahmen: Aufnahme[],
  zipFilename: string,
  dialogTitle: string,
): Promise<void> {
  const { aufnahmenRows, horizonteRows } = buildRows(aufnahmen);

  const zip = new JSZip();
  zip.file("aufnahmen.csv", Papa.unparse(aufnahmenRows, { header: true }));
  zip.file("horizonte.csv", Papa.unparse(horizonteRows, { header: true }));

  const content = await zip.generateAsync({ type: "uint8array" });
  const zipFile = new File(Paths.cache, `${zipFilename}.zip`);
  zipFile.create({ overwrite: true });
  zipFile.write(content);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(zipFile.uri, {
      mimeType: "application/zip",
      dialogTitle,
    });
  } else {
    throw new Error("Sharing is not available on this device.");
  }
}

// ─── Public exports ───────────────────────────────────────────────────────────

/** Exports a single Aufnahme as a ZIP with aufnahmen.csv + horizonte.csv. */
export async function exportAufnahmeAsZip(aufnahme: Aufnahme): Promise<void> {
  await buildAndShareZip(
    [aufnahme],
    `aufnahme_${aufnahme.id}_${sanitizeDate(aufnahme.erstellt_am)}`,
    `Aufnahme ${aufnahme.id} exportieren`,
  );
}

/** Exports all Aufnahmen of a Feldkampagne as a ZIP with aufnahmen.csv + horizonte.csv. */
export async function exportKampagneAsZip(
  kampagneId: number,
  kampagneName: string,
): Promise<void> {
  const aufnahmen = getAufnahmenForFeldkampagne(kampagneId);
  await buildAndShareZip(
    aufnahmen,
    `kampagne_${kampagneName.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
    `Kampagne "${kampagneName}" exportieren`,
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeDate(datetime: string): string {
  return datetime.replace(" ", "_").replace(/:/g, "-");
}
