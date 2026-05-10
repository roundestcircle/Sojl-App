import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  closeAufnahme,
  getAufnahme,
  saveAufnahmeDetails,
  type Aufnahme,
} from "@/utils/MappingQueries";
import { getHorizonteForAufnahme, type Horizont } from "@/utils/HorizonQueries";
import HorizontButton from "@/components/HorizonButton";
import { latLonToUTM, utmToLatLon, type UTMCoord } from "@/utils/utmConversion";

export default function HorizonOverview() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const aufnahmeId = parseInt(id, 10);

  const [horizonte, setHorizonte] = useState<Horizont[]>([]);
  const [aufnahme, setAufnahme] = useState<Aufnahme | null>(null);

  // Location form state (UTM display, lat/lon stored in DB)
  const [easting, setEasting] = useState("");
  const [northing, setNorthing] = useState("");
  const [utmZone, setUtmZone] = useState<UTMCoord["label"] | "">("");
  const [hemisphere, setHemisphere] = useState<"N" | "S">("N");
  const [zoneNumber, setZoneNumber] = useState<number>(32);
  const [notizen, setNotizen] = useState("");
  const [locating, setLocating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setHorizonte(getHorizonteForAufnahme(aufnahmeId));
      const a = getAufnahme(aufnahmeId);
      setAufnahme(a);
      if (a && a.gps_lat != null && a.gps_lon != null) {
        const utm = latLonToUTM(a.gps_lat, a.gps_lon);
        setEasting(String(utm.easting));
        setNorthing(String(utm.northing));
        setUtmZone(utm.label);
        setZoneNumber(utm.zone);
        setHemisphere(utm.hemisphere);
      }
      if (a) setNotizen(a.notizen ?? "");
    }, [aufnahmeId]),
  );

  const handleGetLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Keine Berechtigung", "GPS-Zugriff wurde verweigert.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const utm = latLonToUTM(loc.coords.latitude, loc.coords.longitude);
      setEasting(String(utm.easting));
      setNorthing(String(utm.northing));
      setUtmZone(utm.label);
      setZoneNumber(utm.zone);
      setHemisphere(utm.hemisphere);
    } catch {
      Alert.alert("Fehler", "Standort konnte nicht bestimmt werden.");
    } finally {
      setLocating(false);
    }
  };

  const handleHorizontPress = (horizont: Horizont) => {
    router.push(`/mapping/${aufnahmeId}/horizon/${horizont.nummer}`);
  };

  const handleAbschliessen = () => {
    const offene = horizonte.filter((h) => h.status !== "vollstaendig");

    const doClose = () => {
      // Convert UTM back to lat/lon for storage
      let gps_lat: number | null = null;
      let gps_lon: number | null = null;
      if (easting && northing) {
        const { lat, lon } = utmToLatLon(parseFloat(easting), parseFloat(northing), zoneNumber, hemisphere);
        gps_lat = lat;
        gps_lon = lon;
      }
      saveAufnahmeDetails(aufnahmeId, { gps_lat, gps_lon, notizen: notizen || null });
      closeAufnahme(aufnahmeId);
      const sessionId = aufnahme?.feldkampagne_id;
      if (sessionId != null) {
        router.replace(`/mapping/session/${sessionId}` as any);
      } else {
        router.replace("/mapping" as any);
      }
    };

    if (offene.length > 0) {
      Alert.alert(
        "Aufnahme abschließen?",
        `${offene.length} Horizont${offene.length > 1 ? "e sind" : " ist"} noch nicht vollständig. Trotzdem abschließen?`,
        [
          { text: "Abbrechen", style: "cancel" },
          { text: "Abschließen", style: "destructive", onPress: doClose },
        ],
      );
    } else {
      doClose();
    }
  };

  const alleVollstaendig = horizonte.every((h) => h.status === "vollstaendig");

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={localStyles.content}
      keyboardShouldPersistTaps="handled"
    >

      {/* ── Location form ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Standortdaten</Text>

        <TouchableOpacity
          style={localStyles.gpsButton}
          onPress={handleGetLocation}
          disabled={locating}
        >
          {locating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={localStyles.gpsButtonText}>GPS automatisch bestimmen</Text>
          )}
        </TouchableOpacity>

        <View style={styles.formRow}>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Easting (m)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="z.B. 692000"
              placeholderTextColor={colors.primary + "66"}
              value={easting}
              onChangeText={setEasting}
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.fieldLabel}>Northing (m)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="z.B. 5334000"
              placeholderTextColor={colors.primary + "66"}
              value={northing}
              onChangeText={setNorthing}
            />
          </View>
        </View>

        {utmZone ? (
          <Text style={localStyles.zoneLabel}>UTM Zone {utmZone}</Text>
        ) : null}

        <Text style={styles.fieldLabel}>Notizen</Text>
        <TextInput
          style={[styles.input, localStyles.multiline]}
          placeholder="Freitext..."
          placeholderTextColor={colors.primary + "66"}
          multiline
          numberOfLines={3}
          value={notizen}
          onChangeText={setNotizen}
        />
      </View>

      {/* ── Legend ── */}
      <View style={localStyles.legend}>
        <LegendItem color="#e0e0e0" label="Leer" />
        <LegendItem color="#fff3cd" label="Angefangen" />
        <LegendItem color="#d1e7dd" label="Vollständig" />
      </View>

      {/* ── Horizon grid ── */}
      <View style={localStyles.grid}>
        {horizonte.map((horizont) => (
          <HorizontButton
            key={horizont.id}
            horizont={horizont}
            onPress={() => handleHorizontPress(horizont)}
          />
        ))}
      </View>

      {/* ── Close button ── */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: alleVollstaendig ? colors.primary : "#6c757d", marginTop: 8 },
        ]}
        onPress={handleAbschliessen}
      >
        <Text style={[styles.maintext, { color: "#fff" }]}>
          {alleVollstaendig ? "Aufnahme abschließen" : "Trotzdem abschließen"}
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={localStyles.legendItem}>
      <View style={[localStyles.legendDot, { backgroundColor: color }]} />
      <Text style={localStyles.legendText}>{label}</Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 8,
    paddingBottom: 32,
  },
  gpsButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  gpsButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  zoneLabel: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
    marginTop: -4,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingVertical: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  legendText: {
    fontSize: 12,
    color: "#555",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    paddingVertical: 8,
  },
});
