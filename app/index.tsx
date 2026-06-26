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
import { pickAndImportCampaignZip } from "../utils/zipImport";

export default function Index() {
  // True while a ZIP import is in progress (picker + reconstruction).
  const [importing, setImporting] = useState(false);

  /**
   * Picks a previously exported campaign ZIP and reconstructs it as a new campaign,
   * then navigates into it. No-ops on cancel; alerts on failure.
   */
  const handleImport = async () => {
    try {
      setImporting(true);
      const result = await pickAndImportCampaignZip();
      if (!result) return; // cancelled
      router.push(`/mapping/kampagne/${result.campaignId}` as any);
    } catch (e) {
      Alert.alert("Import fehlgeschlagen", String(e));
    } finally {
      setImporting(false);
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
          Begonnene Kampagne importieren
        </Text>
        {importing ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Text style={styles.chevron}>›</Text>
        )}
      </TouchableOpacity>
      <Link href="/soilcolor" asChild>
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
