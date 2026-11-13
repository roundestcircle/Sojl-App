import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import ValidatedField from "@/components/ui/ValidatedField";
import { ToolModal } from "@/components/ui/ToolModal";
import {
  validatePh,
  validateHumusgehalt,
} from "@/lib/validation/fieldValidation";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  calcBasensaettigung,
  humusGroupLabel,
} from "@/lib/calc/basensaettigungLookup";
import HumusgehaltTool from "@/components/tools/HumusgehaltTool";

export default function BasensaettigungTool() {
  const [pH, setPH] = useState("");
  const [humusPct, setHumusPct] = useState("");
  const [activeModal, setActiveModal] = useState<"humus" | null>(null);

  // humusGroupLabel is null for a missing/non-numeric Humusgehalt (calcBasensaettigung
  // would fall back to the ≤ 4 % curve there); calcBasensaettigung returns "" without pH.
  const group = humusGroupLabel(humusPct);
  const result = group ? calcBasensaettigung(pH, humusPct) : "";

  return (
    <>
      <ScrollView
        contentContainerStyle={localStyles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={localStyles.fieldGroup}>
          <Text style={localStyles.label}>pH (CaCl₂)</Text>
          <ValidatedField
            style={styles.input}
            placeholder="z.B. 5.5"
            placeholderTextColor={colors.primary + "66"}
            keyboardType="decimal-pad"
            onChangeText={setPH}
            value={pH}
            validate={validatePh}
            fieldLabel="pH (CaCl₂)"
          />
        </View>

        <View style={localStyles.fieldGroup}>
          <Text style={localStyles.label}>Humusgehalt</Text>
          <View style={localStyles.inputRow}>
            <ValidatedField
              style={[styles.input, { flex: 1 }]}
              placeholder="z.B. 2.5"
              placeholderTextColor={colors.primary + "66"}
              keyboardType="decimal-pad"
              onChangeText={setHumusPct}
              value={humusPct}
              validate={validateHumusgehalt}
              fieldLabel="Humusgehalt (%)"
            />
            <Text style={localStyles.unit}>%</Text>
            <TouchableOpacity
              style={[styles.actionButton, localStyles.toolBtn]}
              onPress={() => setActiveModal("humus")}
            >
              <Text style={styles.actionButtonText}>Bestimmungshilfe</Text>
            </TouchableOpacity>
          </View>
        </View>

        {result !== "" ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultValue}>{result} %</Text>
            {group && <Text style={styles.resultLabel}>Kurve: {group}</Text>}
          </View>
        ) : (
          <View style={styles.resultBox}>
            <Text style={styles.resultPlaceholder}>
              Fehlende Eingabe – alle Felder ausfüllen
            </Text>
          </View>
        )}
      </ScrollView>

      <ToolModal
        visible={activeModal === "humus"}
        onClose={() => setActiveModal(null)}
      >
        <HumusgehaltTool
          onConfirm={(pct) => {
            setHumusPct(pct);
            setActiveModal(null);
          }}
        />
      </ToolModal>
    </>
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
    fontSize: 15,
  },
  toolBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
