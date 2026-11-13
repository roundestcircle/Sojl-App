import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { getHorizonteForAufnahme } from "@/lib/db/horizontQueries";
import {
  getAufnahmenForFeldkampagne,
  getFeldkampagne,
} from "@/lib/db/feldkampagneQueries";
import type { Aufnahme } from "@/lib/db/aufnahmeQueries";
import { packCampaignZip, type CampaignExport } from "@/lib/io/campaignArchive";

// ─── Shared internals ─────────────────────────────────────────────────────────

async function shareZip(
  content: CampaignExport,
  zipFilename: string,
  dialogTitle: string,
): Promise<void> {
  const bytes = await packCampaignZip(content);
  const zipFile = new File(Paths.cache, `${zipFilename}.zip`);
  zipFile.create({ overwrite: true });
  // Async since SDK 58 — must finish before the share sheet reads the file.
  await zipFile.write(bytes);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(zipFile.uri, {
      mimeType: "application/zip",
      dialogTitle,
    });
  } else {
    throw new Error("Teilen ist auf diesem Gerät nicht verfügbar.");
  }
}

// ─── Public exports ───────────────────────────────────────────────────────────

/** Exports a single Aufnahme as a ZIP with aufnahmen.csv + horizonte.csv. */
export async function exportAufnahmeAsZip(aufnahme: Aufnahme): Promise<void> {
  await shareZip(
    {
      kampagne: null,
      aufnahmen: [aufnahme],
      horizonte: getHorizonteForAufnahme(aufnahme.id),
    },
    `aufnahme_${aufnahme.id}_${sanitizeDate(aufnahme.erstellt_am)}`,
    `Aufnahme ${aufnahme.id} exportieren`,
  );
}

/**
 * Exports a Feldkampagne as a ZIP with kampagne.csv (name, status, erstellt_am),
 * aufnahmen.csv and horizonte.csv.
 */
export async function exportKampagneAsZip(
  kampagneId: number,
  kampagneName: string,
): Promise<void> {
  const kampagne = getFeldkampagne(kampagneId);
  const aufnahmen = getAufnahmenForFeldkampagne(kampagneId);
  await shareZip(
    {
      kampagne: kampagne
        ? {
            name: kampagne.name,
            status: kampagne.status,
            erstellt_am: kampagne.erstellt_am,
          }
        : null,
      aufnahmen,
      horizonte: aufnahmen.flatMap((a) => getHorizonteForAufnahme(a.id)),
    },
    `kampagne_${kampagneName.replace(/[^a-zA-Z0-9_-]/g, "_")}`,
    `Kampagne "${kampagneName}" exportieren`,
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeDate(datetime: string): string {
  return datetime.replace(" ", "_").replace(/:/g, "-");
}
