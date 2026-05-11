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
  erstellt_am: string;
  status: string;
  gps_lat: string;
  gps_lon: string;
  utm_easting: string;
  utm_northing: string;
  utm_zone: string;
  notizen: string;
};

type HorizontCSVRow = {
  aufnahme_id: number;
  horizont_nr: number;
  horizontname: string;
  tiefe_oben: string;
  tiefe_unten: string;
  farbe_munsell: string;
  farbe_rgb_r: string;
  farbe_rgb_g: string;
  farbe_rgb_b: string;
  bodenart: string;
  anteil: string;
  notizen: string;
  status: string;
};

// ─── Shared internals ─────────────────────────────────────────────────────────

function buildRows(aufnahmen: Aufnahme[]): { aufnahmenRows: AufnahmeCSVRow[]; horizonteRows: HorizontCSVRow[] } {
  const aufnahmenRows: AufnahmeCSVRow[] = aufnahmen.map((a) => ({
    aufnahme_id:  a.id,
    erstellt_am:  a.erstellt_am,
    status:       a.status,
    gps_lat:      a.gps_lat != null ? String(a.gps_lat) : "",
    gps_lon:      a.gps_lon != null ? String(a.gps_lon) : "",
    utm_easting:  a.utm_easting != null ? String(a.utm_easting) : "",
    utm_northing: a.utm_northing != null ? String(a.utm_northing) : "",
    utm_zone:     a.utm_zone ?? "",
    notizen:      a.notizen ?? "",
  }));

  const horizonteRows: HorizontCSVRow[] = [];
  for (const aufnahme of aufnahmen) {
    for (const h of getHorizonteForAufnahme(aufnahme.id)) {
      const rgb = h.farbe_rgb ? JSON.parse(h.farbe_rgb) : null;
      horizonteRows.push({
        aufnahme_id:   aufnahme.id,
        horizont_nr:   h.nummer,
        horizontname:  h.horizontname ?? "",
        tiefe_oben:    h.tiefe_oben ?? "",
        tiefe_unten:   h.tiefe_unten ?? "",
        farbe_munsell: h.farbe_munsell ?? "",
        farbe_rgb_r:   rgb ? String(rgb.r) : "",
        farbe_rgb_g:   rgb ? String(rgb.g) : "",
        farbe_rgb_b:   rgb ? String(rgb.b) : "",
        bodenart:      h.bodenart ?? "",
        anteil:        h.anteil ?? "",
        notizen:       h.notizen ?? "",
        status:        h.status,
      });
    }
  }

  return { aufnahmenRows, horizonteRows };
}

async function buildAndShareZip(aufnahmen: Aufnahme[], zipFilename: string, dialogTitle: string): Promise<void> {
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
export async function exportKampagneAsZip(kampagneId: number, kampagneName: string): Promise<void> {
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
