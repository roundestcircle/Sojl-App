import { Link, router } from "expo-router";
import { useState } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Constants from "expo-constants";
import { styles } from "../styles/styles";
import { colors } from "../styles/colors";
import { pickAndImportCampaignZip } from "@/lib/io/zipImport";
import { pickAndImportGpx } from "@/lib/io/gpxImport";

/** "1 Aufnahme" / "3 Aufnahmen". */
function count(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

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
      router.push(`/mapping/kampagne/${result.campaignId}` as any);
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
      router.push(`/mapping/kampagne/${result.campaignId}` as any);
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
    <View style={styles.container}>
      <Link href={"/mapping" as any} asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Kartierung</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <TouchableOpacity
        style={styles.navButton}
        onPress={handleImport}
        disabled={importing}
      >
        <Text style={styles.navButtonLabel}>
          Begonnene Kampagne importieren (ZIP)
        </Text>
        {importing ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Text style={styles.chevron}>›</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navButton}
        onPress={handleImportGpx}
        disabled={importingGpx}
      >
        <Text style={styles.navButtonLabel}>
          Geplante Kampagne importieren (GPX)
        </Text>
        {importingGpx ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Text style={styles.chevron}>›</Text>
        )}
      </TouchableOpacity>
      <Link href="/tools/bodenfarbe" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>Nur Bodenfarbe bestimmen</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href={"/tools" as any} asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>
            Weitere Kartierungsunterstützung
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/about" asChild>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonLabel}>About</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </Link>
      <View style={styles.footnote}>
        <Image
          source={require("../assets/images/icon.png")}
          style={{ width: 48, height: 48, borderRadius: 10 }}
        />
        <Text style={{ fontSize: 9 }}>
          Version {Constants.expoConfig?.version ?? ""}
        </Text>
      </View>
    </View>
  );
}
