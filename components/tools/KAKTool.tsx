import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import ValidatedField from "@/components/ui/ValidatedField";
import { ToolModal } from "@/components/ui/ToolModal";
import {
  validateBodenart,
  validateHumusgehalt,
} from "@/lib/validation/fieldValidation";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  calcKAK,
  rateKAK,
  HUMUSFORMEN,
  type Humusform,
} from "@/lib/calc/mappingMaths";
import TreeTool from "@/components/tools/TreeTool";
import HumusgehaltTool from "@/components/tools/HumusgehaltTool";
import HumusformLexikonContent from "@/components/lexikon/HumusformLexikonContent";

export default function KAKTool() {
  const [bodenart, setBodenart] = useState("");
  const [humusform, setHumusform] = useState<Humusform | null>(null);
  const [humusPct, setHumusPct] = useState("");
  const [activeModal, setActiveModal] = useState<
    "bodenart" | "humus" | "humusform" | null
  >(null);

  // calcKAK returns "" for an unknown Bodenart or missing Humusform / Humusgehalt.
  const result = calcKAK(bodenart, humusform ?? "", humusPct);

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
            {HUMUSFORMEN.map((opt) => (
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
            <Text style={styles.resultLabel}>{rateKAK(Number(result))}</Text>
            <Text style={styles.resultLabel}>
              inkl. Humuskorrektur ({humusform})
            </Text>
          </View>
        ) : (
          <View style={styles.resultBox}>
            <Text style={styles.resultPlaceholder}>
              Fehlende oder ungültige Eingabe
            </Text>
          </View>
        )}
      </ScrollView>

      <ToolModal
        visible={activeModal === "bodenart"}
        onClose={() => setActiveModal(null)}
      >
        <TreeTool
          kind="bodenart"
          onConfirm={(result) => {
            setBodenart(result);
            setActiveModal(null);
          }}
        />
      </ToolModal>

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

      <ToolModal
        visible={activeModal === "humusform"}
        onClose={() => setActiveModal(null)}
      >
        <HumusformLexikonContent />
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
});
