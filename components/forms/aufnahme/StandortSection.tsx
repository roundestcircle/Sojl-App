import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  type KeyboardTypeOptions,
} from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import * as Location from "expo-location";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { latLonToUTM } from "@/lib/geo/utmConversion";
import { PLACEHOLDER_COLOR } from "../shared";
import type { AufnahmeFormData, CoordMode } from "./types";

type CoordField = {
  name: "easting" | "northing" | "zone" | "lat" | "lon";
  label: string;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  narrow?: boolean;
};

const UTM_FIELDS: CoordField[] = [
  {
    name: "easting",
    label: "Ostwert (6a)",
    placeholder: "z.B. 692000",
    keyboardType: "number-pad",
  },
  {
    name: "northing",
    label: "Nordwert (6b)",
    placeholder: "z.B. 5334000",
    keyboardType: "number-pad",
  },
  { name: "zone", label: "Zone", placeholder: "32N", narrow: true },
];

const DEGREE_FIELDS: CoordField[] = [
  {
    name: "lat",
    label: "Breite (°)",
    placeholder: "z.B. 51.5074",
    keyboardType: "decimal-pad",
  },
  {
    name: "lon",
    label: "Länge (°)",
    placeholder: "z.B. 9.3456",
    keyboardType: "decimal-pad",
  },
];

/**
 * "Standortdaten" block: coordinate entry (UTM or decimal degrees, switchable),
 * GPS fix button and Höhe. The parent owns `mode` because autosave needs it.
 */
export default function StandortSection({
  mode,
  onToggleMode,
}: {
  mode: CoordMode;
  onToggleMode: () => void;
}) {
  const { control, setValue } = useFormContext<AufnahmeFormData>();
  // Drives the spinner on the GPS button while location is being fetched
  const [locating, setLocating] = useState(false);

  /** Requests a GPS fix and fills both coordinate formats. */
  const handleGetLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Keine Berechtigung", "GPS-Zugriff wurde verweigert.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = loc.coords;
      const utm = latLonToUTM(latitude, longitude);
      setValue("easting", String(utm.easting));
      setValue("northing", String(utm.northing));
      setValue("zone", utm.label);
      setValue("lat", latitude.toFixed(6));
      setValue("lon", longitude.toFixed(6));
    } catch {
      Alert.alert("Fehler", "Standort konnte nicht bestimmt werden.");
    } finally {
      setLocating(false);
    }
  };

  return (
    <>
      <Text style={styles.sectionTitle}>Standortdaten</Text>

      <View style={styles.formRow}>
        {(mode === "utm" ? UTM_FIELDS : DEGREE_FIELDS).map((f) => (
          <View
            key={f.name}
            style={[styles.halfField, f.narrow && { flex: 0.6 }]}
          >
            <Text style={styles.fieldLabel}>{f.label}</Text>
            <Controller
              control={control}
              name={f.name}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  keyboardType={f.keyboardType}
                  autoCapitalize={f.name === "zone" ? "characters" : undefined}
                  placeholder={f.placeholder}
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity style={localStyles.toggleButton} onPress={onToggleMode}>
        <Text style={localStyles.toggleText}>
          {mode === "utm" ? "Zu Dezimalgrad wechseln" : "Zu UTM wechseln"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleGetLocation}
        disabled={locating}
      >
        {locating ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.actionButtonText}>GPS automatisch bestimmen</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.fieldLabel}>Höhe (m ü. NN) (8a)</Text>
      <Controller
        control={control}
        name="m_ue_nn"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            placeholder="z.B. 350"
            placeholderTextColor={PLACEHOLDER_COLOR}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
    </>
  );
}

const localStyles = StyleSheet.create({
  toggleButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  toggleText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "500",
  },
});
