import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from "react-native";
import ValidatedField from "@/components/ValidatedField";
import { validatePh, validateHumusgehalt } from "@/utils/fieldValidation";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  calcBasensaettigung,
  humusGroupLabel,
} from "@/utils/BasensaettigungLookup";
import { SafeAreaView } from "react-native-safe-area-context";
import HumusgehaltTool from "@/components/HumusgehaltTool";

export default function BasensaettigungTool() {
  const [pH, setPH] = useState("");
  const [humusPct, setHumusPct] = useState("");
  const [activeModal, setActiveModal] = useState<"humus" | null>(null);

  const allFilled =
    pH !== "" &&
    !isNaN(parseFloat(pH)) &&
    humusPct !== "" &&
    !isNaN(parseFloat(humusPct));
  const result = allFilled ? calcBasensaettigung(pH, humusPct) : "";
  const group = allFilled ? humusGroupLabel(humusPct) : null;

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
            <Text style={styles.resultPlaceholder}>Alle Felder ausfüllen</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={activeModal === "humus"}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={localStyles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Text style={localStyles.modalClose}>✕ Schließen</Text>
            </TouchableOpacity>
          </View>
          <HumusgehaltTool
            onConfirm={(_klasse, pct) => {
              setHumusPct(pct);
              setActiveModal(null);
            }}
          />
        </SafeAreaView>
      </Modal>
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  modalClose: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
