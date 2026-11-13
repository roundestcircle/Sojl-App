import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import ValidatedField from "@/components/ui/ValidatedField";
import { ToolModal } from "@/components/ui/ToolModal";
import Button from "@/components/ui/Button";
import ChoiceChips from "@/components/ui/ChoiceChips";
import { WithToolButton, WithUnit } from "@/components/forms/shared";
import {
  validateBodenart,
  validateHumusgehalt,
} from "@/lib/validation/fieldValidation";
import { styles } from "@/styles/styles";
import {
  calcKAK,
  rateKAK,
  HUMUSFORMEN,
  type Humusform,
} from "@/lib/calc/mappingMaths";
import TreeTool from "@/components/tools/TreeTool";
import HumusgehaltTool from "@/components/tools/HumusgehaltTool";
import HumusformLexikonContent from "@/components/lexikon/HumusformLexikonContent";

const HUMUSFORM_CHOICES = HUMUSFORMEN.map((h) => ({ value: h, label: h }));

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
        contentContainerStyle={styles.toolContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Bodenart</Text>
          <WithToolButton onPress={() => setActiveModal("bodenart")}>
            <ValidatedField
              placeholder="z.B. Su2, Lt3, Tt"
              autoCapitalize="none"
              onChangeText={setBodenart}
              value={bodenart}
              validate={validateBodenart}
              fieldLabel="Bodenart"
            />
          </WithToolButton>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Humusform</Text>
          <ChoiceChips
            choices={HUMUSFORM_CHOICES}
            value={humusform}
            onChange={setHumusform}
            deselectable
          />
          <Button
            title="Humusformlexikon"
            style={{ marginTop: 8 }}
            onPress={() => setActiveModal("humusform")}
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
              <Text style={styles.resultValue}>{result} cmol_c/kg</Text>
              <Text style={styles.resultLabel}>{rateKAK(Number(result))}</Text>
              <Text style={styles.resultLabel}>
                inkl. Humuskorrektur ({humusform})
              </Text>
            </>
          ) : (
            <Text style={styles.resultPlaceholder}>
              Fehlende oder ungültige Eingabe
            </Text>
          )}
        </View>
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
