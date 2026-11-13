import * as DocumentPicker from "expo-document-picker";
import { File } from "expo-file-system";
import db from "@/lib/db/db";
import { createFeldkampagne } from "@/lib/db/feldkampagneQueries";
import {
  createAufnahme,
  saveAufnahmeDetails,
  setAufnahmeImportMeta,
} from "@/lib/db/aufnahmeQueries";
import { horizontStatus, insertHorizont } from "@/lib/db/horizontQueries";
import {
  groupHorizonte,
  orderAufnahmen,
  unpackCampaignZip,
} from "@/lib/io/campaignArchive";
import { campaignNameFromFile, sqliteTimestamp } from "@/lib/io/importUtils";

export type ImportResult = {
  campaignId: number;
  aufnahmen: number;
  horizonte: number;
  /** horizonte.csv rows whose aufnahme_id is not in aufnahmen.csv. */
  skippedHorizonte: number;
};

/**
 * Lets the user pick a previously exported ZIP and reconstructs it as a
 * brand-new Feldkampagne, restoring every Aufnahme (nummer, name, status,
 * erstellt_am) and Horizont (nummer, status). Kampagne name, status and
 * erstellt_am come from kampagne.csv; ZIPs without it (single-Aufnahme or older
 * exports) are named after the file. Returns null if the user cancels.
 *
 * Everything, including the Feldkampagne itself, is created in one transaction,
 * so a malformed file never leaves a half-imported campaign behind.
 */
export async function pickAndImportCampaignZip(): Promise<ImportResult | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    // Some Android file providers report .zip files as application/octet-stream;
    // without it they would be greyed out in the picker. Non-ZIP content is
    // rejected by unpackCampaignZip.
    type: [
      "application/zip",
      "application/x-zip-compressed",
      "application/octet-stream",
    ],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (picked.canceled || !picked.assets?.length) return null;
  const asset = picked.assets[0];

  const parsed = await unpackCampaignZip(await new File(asset.uri).bytes());
  const aufnahmen = orderAufnahmen(parsed.aufnahmen);
  const { byAufnahme, orphans } = groupHorizonte(
    parsed.horizonte,
    new Set(parsed.aufnahmen.map((a) => a.sourceId)),
  );

  const now = sqliteTimestamp();
  const kampagne = parsed.kampagne;
  // The exporter prefixes campaign ZIPs with "kampagne_".
  const name =
    kampagne?.name ??
    campaignNameFromFile(asset.name.replace(/^kampagne_/, ""));

  let campaignId = 0;
  let horizonteCount = 0;
  db.withTransactionSync(() => {
    campaignId = createFeldkampagne(name, {
      status: kampagne?.status ?? "offen",
      erstellt_am: kampagne?.erstellt_am ?? now,
    });
    for (const { aufnahme, nummer } of aufnahmen) {
      const id = createAufnahme(campaignId);
      saveAufnahmeDetails(id, aufnahme.details);
      setAufnahmeImportMeta(id, {
        status: aufnahme.status ?? "offen",
        erstellt_am: aufnahme.erstellt_am ?? now,
        name: aufnahme.name,
        nummer,
      });
      for (const h of byAufnahme.get(aufnahme.sourceId) ?? []) {
        insertHorizont(
          id,
          h.nummer,
          h.status ?? horizontStatus(h.data),
          h.data,
        );
        horizonteCount++;
      }
    }
  });

  return {
    campaignId,
    aufnahmen: aufnahmen.length,
    horizonte: horizonteCount,
    skippedHorizonte: orphans,
  };
}
