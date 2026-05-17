import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import ValidatedField from "@/components/ValidatedField";
import { validateBodenart, validateHumusgehalt } from "@/utils/fieldValidation";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { calcKAK, rateKAK } from "@/utils/MappingMaths";
import { SafeAreaView } from "react-native-safe-area-context";
import TexTree from "@/components/TexTree";
import HumusgehaltTool from "@/components/HumusgehaltTool";
import HumusformLexikonContent from "@/components/HumusformLexikonContent";

const HUMUSFORM_OPTIONS = ["Mull", "Moder", "Rohhumus"] as const;
type Humusform = (typeof HUMUSFORM_OPTIONS)[number];

export default function KAKTool() {
  const [bodenart, setBodenart] = useState("");
  const [humusform, setHumusform] = useState<Humusform | null>(null);
  const [humusPct, setHumusPct] = useState("");
  const [activeModal, setActiveModal] = useState<
    "bodenart" | "humus" | "humusform" | null
  >(null);

  const allFilled =
    bodenart.trim() !== "" &&
    humusform !== null &&
    humusPct !== "" &&
    !isNaN(parseFloat(humusPct));
  const result = allFilled
    ? calcKAK(bodenart.trim(), humusform ?? "", humusPct)
    : "";

  return (
    <>
      <ScrollView
        contentContainerStyle={localStyles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={localStyles.fieldGroup}>
          <Text style={localStyles.label}>Bodenart</Text>
          <View style={localStyles.fieldWithTool}>
            <ValidatedField
              style={[styles.input, { flex: 1 }]}
              placeholder="z.B. Su2, Lt3, Tt"
              placeholderTextColor={colors.primary + "66"}
              autoCapitalize="none"
              onChangeText={setBodenart}
              value={bodenart}
              validate={validateBodenart}
              fieldLabel="Bodenart"
            />
            <TouchableOpacity
              style={[styles.actionButton, localStyles.toolBtn]}
              onPress={() => setActiveModal("bodenart")}
            >
              <Text style={styles.actionButtonText}>Bestimmungshilfe</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={localStyles.fieldGroup}>
          <Text style={localStyles.label}>Humusform</Text>
          <View style={localStyles.btnRow}>
            {HUMUSFORM_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  localStyles.optionBtn,
                  humusform === opt && localStyles.optionBtnActive,
                ]}
                onPress={() =>
                  setHumusform((prev) => (prev === opt ? null : opt))
                }
              >
                <Text
                  style={[
                    localStyles.optionBtnText,
                    humusform === opt && localStyles.optionBtnTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.actionButton, localStyles.toolBtn, { marginTop: 8 }]}
            onPress={() => setActiveModal("humusform")}
          >
            <Text style={styles.actionButtonText}>Humusformlexikon</Text>
          </TouchableOpacity>
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
            <Text style={styles.resultValue}>{result} cmol_c/kg</Text>
            <Text style={styles.resultLabel}>
              {rateKAK(parseFloat(result))}
            </Text>
            <Text style={styles.resultLabel}>
              inkl. Humuskorrektur ({humusform})
            </Text>
          </View>
        ) : (
          <View style={styles.resultBox}>
            <Text style={styles.resultPlaceholder}>Alle Felder ausfüllen</Text>
          </View>
        )}
      </ScrollView>

      {/* Farbe / Bodenart modals */}
      <Modal
        visible={activeModal === "bodenart"}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={localStyles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Text style={localStyles.modalClose}>✕ Schließen</Text>
            </TouchableOpacity>
          </View>
          <TexTree
            onConfirm={(result) => {
              setBodenart(result);
              setActiveModal(null);
            }}
          />
        </SafeAreaView>
      </Modal>

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
            onConfirm={(klasse, pct) => {
              setHumusPct(pct);
              setActiveModal(null);
            }}
          />
        </SafeAreaView>
      </Modal>

      <Modal
        visible={activeModal === "humusform"}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={localStyles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Text style={localStyles.modalClose}>✕ Schließen</Text>
            </TouchableOpacity>
          </View>
          <HumusformLexikonContent />
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
  btnRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  optionBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary + "55",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  optionBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  optionBtnTextActive: {
    color: "#fff",
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
  fieldWithTool: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
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
