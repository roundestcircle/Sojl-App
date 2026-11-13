import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import ValidatedField from "@/components/ui/ValidatedField";
import { ToolModal } from "@/components/ui/ToolModal";
import { WithToolButton, WithUnit } from "@/components/forms/shared";
import {
  validatePh,
  validateHumusgehalt,
} from "@/lib/validation/fieldValidation";
import { styles } from "@/styles/styles";
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
        contentContainerStyle={styles.toolContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>pH (CaCl₂)</Text>
          <ValidatedField
            placeholder="z.B. 5.5"
            keyboardType="decimal-pad"
            onChangeText={setPH}
            value={pH}
            validate={validatePh}
            fieldLabel="pH (CaCl₂)"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Humusgehalt</Text>
          <WithToolButton onPress={() => setActiveModal("humus")}>
            <WithUnit unit="%">
              <ValidatedField
                placeholder="z.B. 2.5"
                keyboardType="decimal-pad"
                onChangeText={setHumusPct}
                value={humusPct}
                validate={validateHumusgehalt}
                fieldLabel="Humusgehalt (%)"
              />
            </WithUnit>
          </WithToolButton>
        </View>

        <View style={styles.resultBox}>
          {result !== "" ? (
            <>
              <Text style={styles.resultValue}>{result} %</Text>
              {group && <Text style={styles.resultLabel}>Kurve: {group}</Text>}
            </>
          ) : (
            <Text style={styles.resultPlaceholder}>
              Fehlende Eingabe – alle Felder ausfüllen
            </Text>
          )}
        </View>
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
