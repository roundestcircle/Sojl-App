import { router } from "expo-router";
import { useState } from "react";
import { Text, View, Image, Alert, StyleSheet } from "react-native";
import Constants from "expo-constants";
import { styles } from "@/styles/styles";
import { fontSize } from "@/styles/theme";
import NavRow from "@/components/ui/NavRow";
import { pickAndImportCampaignZip } from "@/lib/io/zipImport";
import { pickAndImportGpx } from "@/lib/io/gpxImport";
import { count } from "@/lib/text";

/** The message of a thrown error without the "Error: " prefix. */
function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function Index() {
  // True while a ZIP import is in progress (picker + reconstruction).
  const [importing, setImporting] = useState(false);
  // True while a GPX import is in progress (picker + waypoint creation).
  const [importingGpx, setImportingGpx] = useState(false);

  /**
   * Picks a previously exported campaign ZIP and reconstructs it as a new campaign,
   * then navigates into it and reports the counts. No-ops on cancel; alerts on failure.
   */
  const handleImport = async () => {
    try {
      setImporting(true);
      const result = await pickAndImportCampaignZip();
      if (!result) return; // cancelled
      router.push(`/mapping/kampagne/${result.campaignId}`);
      let message = `${count(result.aufnahmen, "Aufnahme", "Aufnahmen")}, ${count(result.horizonte, "Horizont", "Horizonte")} importiert.`;
      if (result.skippedHorizonte > 0) {
        message += `

${count(result.skippedHorizonte, "Horizont", "Horizonte")} ohne zugehörige Aufnahme übersprungen.`;
      }
      Alert.alert("Import abgeschlossen", message);
    } catch (e) {
      Alert.alert("Import fehlgeschlagen", errorMessage(e));
    } finally {
      setImporting(false);
    }
  };

  /**
   * Picks a GPX file, creates a planned campaign with one Aufnahme per waypoint,
   * then navigates into it and reports the count. No-ops on cancel; alerts on
   * error or empty file.
   */
  const handleImportGpx = async () => {
    try {
      setImportingGpx(true);
      const result = await pickAndImportGpx();
      if (!result) return; // cancelled
      router.push(`/mapping/kampagne/${result.campaignId}`);
      Alert.alert(
        "Import abgeschlossen",
        `${count(result.count, "Wegpunkt", "Wegpunkte")} importiert.`,
      );
    } catch (e) {
      Alert.alert("Import fehlgeschlagen", errorMessage(e));
    } finally {
      setImportingGpx(false);
    }
  };

  return (
    <View style={styles.centered}>
      <NavRow title="Kartierung" href="/mapping" />
      <NavRow
        title="Begonnene Kampagne importieren (ZIP)"
        onPress={handleImport}
        loading={importing}
      />
      <NavRow
        title="Geplante Kampagne importieren (GPX)"
        onPress={handleImportGpx}
        loading={importingGpx}
      />
      <NavRow title="Nur Bodenfarbe bestimmen" href="/tools/bodenfarbe" />
      <NavRow title="Weitere Kartierungsunterstützung" href="/tools" />
      <NavRow title="About" href="/about" />
      <View style={localStyles.footnote}>
        <Image
          source={require("../assets/images/icon.png")}
          style={localStyles.icon}
        />
        <Text style={localStyles.version}>
          Version {Constants.expoConfig?.version ?? ""}
        </Text>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  footnote: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
    gap: 4,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  version: {
    fontSize: fontSize.xs,
  },
});
