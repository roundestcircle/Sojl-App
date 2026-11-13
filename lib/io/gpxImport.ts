import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import db from "@/lib/db/db";
import { createFeldkampagne } from "@/lib/db/feldkampagneQueries";
import { createAufnahmeAtLocation } from "@/lib/db/aufnahmeQueries";
import { parseGpxWaypoints } from "@/lib/io/gpx";
import { campaignNameFromFile } from "@/lib/io/importUtils";

/**
 * Lets the user pick a GPX file and creates a new Feldkampagne (named after the
 * file) with one Aufnahme per `<wpt>` waypoint, GPS/UTM coordinates and the
 * waypoint name prefilled. Imported Aufnahmen start with 0 Horizonte.
 *
 * Returns null if the user cancels. Throws if the file contains no valid
 * waypoints. Campaign and Aufnahmen are created in one transaction.
 */
export async function pickAndImportGpx(): Promise<{
  campaignId: number;
  count: number;
} | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    // Android has no MIME mapping for .gpx, so most file providers report it as
    // application/octet-stream; without it .gpx files would be greyed out.
    type: [
      "application/gpx+xml",
      "application/xml",
      "text/xml",
      "application/octet-stream",
    ],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (picked.canceled || !picked.assets?.length) return null;
  const asset = picked.assets[0];

  const xml = await new File(asset.uri).text();
  const waypoints = parseGpxWaypoints(xml);
  if (waypoints.length === 0) {
    throw new Error(
      "Keine gültigen Wegpunkte (<wpt>) in der GPX-Datei gefunden.",
    );
  }

  const name = campaignNameFromFile(asset.name);
  let campaignId = 0;
  db.withTransactionSync(() => {
    campaignId = createFeldkampagne(name);
    for (const wp of waypoints) {
      createAufnahmeAtLocation(campaignId, wp.lat, wp.lon, wp.name ?? null);
    }
  });

  return { campaignId, count: waypoints.length };
}
