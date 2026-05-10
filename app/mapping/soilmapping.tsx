import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { createAufnahme } from "@/utils/MappingQueries";
// horizontQueries is used in HorizonOverview and [nr].tsx, not here

/**
 * SoilMappingScreen (soilmapping.tsx)
 *
 * Entry point for a new Bodenaufnahme.
 * User enters the number of horizons → DB creates the Aufnahme + empty Horizonte
 * → navigates to HorizonOverview.
 */
export default function SoilMappingScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const [input, setInput] = useState<string>("");

  const handleStart = () => {
    const anzahl = parseInt(input, 10);

    if (isNaN(anzahl) || anzahl < 1) {
      Alert.alert("Ungültige Eingabe", "Bitte eine Zahl größer als 0 eingeben.");
      return;
    }

    if (anzahl > 20) {
      Alert.alert("Ungültige Eingabe", "Bitte eine Zahl von maximal 20 eingeben.");
      return;
    }

    try {
      // Create Aufnahme + n empty Horizonte in SQLite
      const aufnahmeId = createAufnahme(anzahl, parseInt(sessionId, 10));

      // Navigate to the Horizont overview for this Aufnahme
      router.push(`/mapping/${aufnahmeId}/HorizonOverview`);
    } catch (e) {
      console.error("Fehler beim Erstellen der Aufnahme:", e);
      Alert.alert("Fehler", "Die Aufnahme konnte nicht erstellt werden.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ gap: 24, alignItems: "center", width: "100%" }}>

        <Text style={styles.maintext}>
          Wie viele Horizonte hat das Profil?
        </Text>

        {/* Number input */}
        <TextInput
          style={[
            styles.button,
            {
              textAlign: "center",
              fontSize: (styles.maintext as any).fontSize ?? 18,
              color: (styles.maintext as any).color,
              minWidth: 120,
            },
          ]}
          keyboardType="number-pad"
          placeholder="z.B. 3"
          placeholderTextColor={colors.primary + "88"}
          value={input}
          onChangeText={setInput}
          maxLength={2}
          returnKeyType="done"
          onSubmitEditing={handleStart}
        />

        {/* Quick-select buttons for common horizon counts */}
        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {[2, 3, 4, 5].map((n) => (
            <TouchableOpacity
              key={n}
              style={[
                styles.button,
                {
                  paddingHorizontal: 20,
                  backgroundColor: input === String(n) ? colors.primary : "transparent",
                  borderWidth: 1,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => setInput(String(n))}
            >
              <Text
                style={[
                  styles.maintext,
                  { color: input === String(n) ? "#fff" : colors.primary },
                ]}
              >
                {n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Start button */}
        <TouchableOpacity
          style={[
            styles.button,
            { opacity: input.length === 0 ? 0.4 : 1 },
          ]}
          onPress={handleStart}
          disabled={input.length === 0}
        >
          <Text style={styles.maintext}>Aufnahme starten</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}