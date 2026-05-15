import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { calcBasensaettigung } from "@/utils/BasensaettigungLookup";

function humusGroup(humusPct: string): string | null {
  const n = parseFloat(humusPct);
  if (isNaN(n)) return null;
  if (n <= 4) return "≤ 4 % Humus";
  if (n < 15) return "4 – 15 % Humus";
  return "≥ 15 % Humus";
}

export default function BasensaettigungTool() {
  const [pH, setPH] = useState("");
  const [humusPct, setHumusPct] = useState("");

  const allFilled =
    pH !== "" &&
    !isNaN(parseFloat(pH)) &&
    humusPct !== "" &&
    !isNaN(parseFloat(humusPct));
  const result = allFilled ? calcBasensaettigung(pH, humusPct) : "";
  const group = allFilled ? humusGroup(humusPct) : null;

  return (
    <ScrollView
      contentContainerStyle={localStyles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={localStyles.fieldGroup}>
        <Text style={localStyles.label}>pH (CaCl₂)</Text>
        <TextInput
          style={styles.input}
          placeholder="z.B. 5.5"
          placeholderTextColor={colors.primary + "66"}
          keyboardType="decimal-pad"
          onChangeText={setPH}
          value={pH}
        />
      </View>

      <View style={localStyles.fieldGroup}>
        <Text style={localStyles.label}>Humusgehalt</Text>
        <View style={localStyles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="z.B. 2.5"
            placeholderTextColor={colors.primary + "66"}
            keyboardType="decimal-pad"
            onChangeText={setHumusPct}
            value={humusPct}
          />
          <Text style={localStyles.unit}>%</Text>
        </View>
      </View>

      {result !== "" ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultValue}>{result} %</Text>
          {group && <Text style={styles.resultLabel}>Kurve: {group}</Text>}
        </View>
      ) : (
        <View style={styles.resultBox}>
          <Text style={styles.resultPlaceholder}>Alle Felder ausfüllen</Text>
        </View>
      )}
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  unit: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 18,
  },
});
