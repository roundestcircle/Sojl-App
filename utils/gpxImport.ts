import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import db from "./db";
import { createFeldkampagne } from "./FeldkampagneQueries";
import { createAufnahmeAtLocation } from "./MappingQueries";
import { parseGpxWaypoints } from "./gpx";

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Derives a campaign name from the picked file: drops the extension and trims. */
function campaignNameFromFile(fileName: string): string {
  const base = fileName.replace(/\.gpx$/i, "").replace(/\.[^.]+$/, "");
  return base.trim() || "Importierte Kampagne";
}

// ─── Public entry point ─────────────────────────────────────────────────────────

/**
 * Lets the user pick a GPX file and creates a new Feldkampagne (named after the
 * file) with one Aufnahme per `<wpt>` waypoint, GPS/UTM coordinates and the
 * waypoint name prefilled. Imported Aufnahmen start with 0 horizons.
 *
 * Returns null if the user cancels. Throws if the file contains no waypoints.
 */
export async function pickAndImportGpx(): Promise<{
  campaignId: number;
  count: number;
} | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ["application/gpx+xml", "application/xml", "text/xml", "*/*"],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (picked.canceled || !picked.assets?.length) return null;
  const asset = picked.assets[0];

  const xml = await new File(asset.uri).text();
  const waypoints = parseGpxWaypoints(xml);
  if (waypoints.length === 0) {
    throw new Error("Keine Wegpunkte (<wpt>) in der GPX-Datei gefunden.");
  }

  const name = campaignNameFromFile(asset.name);
  const campaignId = createFeldkampagne(name);

  db.withTransactionSync(() => {
    for (const wp of waypoints) {
      createAufnahmeAtLocation(campaignId, wp.lat, wp.lon, wp.name ?? null);
    }
  });

  return { campaignId, count: waypoints.length };
}
