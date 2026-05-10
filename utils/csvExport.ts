import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import Papa from "papaparse";
import { getHorizonteForAufnahme } from "./HorizonQueries";
import type { Aufnahme } from "./MappingQueries";

// ─── Types ────────────────────────────────────────────────────────────────────

/** One row in the exported CSV */
type CSVRow = {
  aufnahme_id: number;
  erstellt_am: string;
  gps_lat: string;
  gps_lon: string;
  horizont_nr: number;
  tiefe_oben: string;
  tiefe_unten: string;
  farbe_munsell: string;
  farbe_rgb_r: string;
  farbe_rgb_g: string;
  farbe_rgb_b: string;
  bodenart: string;
  anteil: string;
  notizen: string;
  horizont_status: string;
};

// ─── Main export function ─────────────────────────────────────────────────────

/**
 * Builds a CSV from all Horizonte of an Aufnahme and opens the share sheet.
 * Call this just before navigating away after closeAufnahme().
 *
 * @param aufnahme - The Aufnahme row (for metadata like GPS and date)
 */
export async function exportAufnahmeAsCSV(aufnahme: Aufnahme): Promise<void> {
  const horizonte = getHorizonteForAufnahme(aufnahme.id);

  // Build one CSV row per Horizont
  const rows: CSVRow[] = horizonte.map((h) => {
    // Parse RGB from stored JSON string if available
    const rgb = h.farbe_rgb ? JSON.parse(h.farbe_rgb) : null;

    return {
      aufnahme_id:    aufnahme.id,
      erstellt_am:    aufnahme.erstellt_am,
      gps_lat:        aufnahme.gps_lat != null ? String(aufnahme.gps_lat) : "",
      gps_lon:        aufnahme.gps_lon != null ? String(aufnahme.gps_lon) : "",
      horizont_nr:    h.nummer,
      tiefe_oben:     "",   // extend when tiefe is added to DB
      tiefe_unten:    "",
      farbe_munsell:  h.farbe_munsell ?? "",
      farbe_rgb_r:    rgb ? String(rgb.r) : "",
      farbe_rgb_g:    rgb ? String(rgb.g) : "",
      farbe_rgb_b:    rgb ? String(rgb.b) : "",
      bodenart:       h.bodenart ?? "",
      anteil:         h.anteil ?? "",
      notizen:        h.notizen ?? "",
      horizont_status: h.status,
    };
  });

  // Convert to CSV string
  const csv = Papa.unparse(rows, { header: true });

  // Write to a temp file in the app's cache directory
  const filename = `aufnahme_${aufnahme.id}_${sanitizeDate(aufnahme.erstellt_am)}.csv`;
  const file = new File(Paths.cache, filename);
  file.create({ overwrite: true });
  file.write(csv);

  // Open the native share sheet
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "text/csv",
      dialogTitle: `Aufnahme ${aufnahme.id} exportieren`,
      UTI: "public.comma-separated-values-text", // iOS
    });
  } else {
    throw new Error("Sharing is not available on this device.");
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Turns a SQLite datetime string into a filename-safe string */
function sanitizeDate(datetime: string): string {
  // "2024-05-09 14:32:00" → "2024-05-09_14-32-00"
  return datetime.replace(" ", "_").replace(/:/g, "-");
}