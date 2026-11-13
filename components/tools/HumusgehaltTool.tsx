import { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Alert } from "react-native";
import ValidatedField from "@/components/ui/ValidatedField";
import { ToolModal } from "@/components/ui/ToolModal";
import Button from "@/components/ui/Button";
import ChoiceChips, { type Choice } from "@/components/ui/ChoiceChips";
import { WithToolButton } from "@/components/forms/shared";
import {
  validateTonanteil,
  validatePh,
  validateBodenart,
  validateMunsellValue,
} from "@/lib/validation/fieldValidation";
import { styles } from "@/styles/styles";
import { spacing } from "@/styles/theme";
import PictureTaker from "@/components/tools/PictureTaker";
import TreeTool from "@/components/tools/TreeTool";
import {
  estimateHumusFromInputs,
  humusKlasse,
  parseMunsell,
  chromaToClass,
  type ChromaClass,
} from "@/lib/calc/renger1987";
import {
  bodenartToClay,
  bodenartToClayMidpoint,
} from "@/lib/calc/bodenartClay";
import { parseDecimal } from "@/lib/number";

type Props = {
  /** Receives the estimated Humusgehalt in % (dot decimal, e.g. "2.4"). */
  onConfirm?: (pct: string) => void;
};

/**
 * Chroma classes of the Renger (1987) diagram. `chroma` is a representative
 * Munsell Chroma inside the class, used to build the notation passed to
 * `estimateHumusFromInputs`.
 */
const CHROMA_OPTIONS: (Choice<ChromaClass> & { chroma: number })[] = [
  { label: "> 6", value: "high", sub: "leuchtend", chroma: 8 },
  { label: "3,5 – 6", value: "mid", sub: "mittel", chroma: 4 },
  { label: "< 3,5", value: "low", sub: "matt / grau", chroma: 2 },
];

/** Valid KA5/KA6 Bodenart codes, grouped by Hauptbodenart (error hint). */
const BODENART_HINT = [
  "Ss, Su2, Su3, Su4, Sl2, Sl3, Sl4, Slu, St2, St3",
  "Uu, Us, Uls, Ut2, Ut3, Ut4",
  "Ls2, Ls3, Ls4, Lu, Lt2, Lt3, Lts",
  "Ts2, Ts3, Ts4, Tl, Tu2, Tu3, Tu4, Tt",
].join("\n");

export default function HumusgehaltTool({ onConfirm }: Props) {
  const [chroma, setChroma] = useState<ChromaClass | null>(null);
  const [valueStr, setValueStr] = useState("");
  const [bodenart, setBodenart] = useState("");
  const [clayStr, setClayStr] = useState("");
  const [clayRange, setClayRange] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [phStr, setPhStr] = useState("");
  const [activeModal, setActiveModal] = useState<"farbe" | "bodenart" | null>(
    null,
  );

  function estimateClayFromBodenart() {
    const check = validateBodenart(bodenart);
    const canonical = check.valid ? (check.normalized ?? "") : "";
    const midpoint = bodenartToClayMidpoint(canonical);
    const range = bodenartToClay(canonical);
    if (midpoint !== null && range !== null) {
      setClayStr(String(midpoint));
      setClayRange(range);
    } else {
      Alert.alert(
        "Ungültige Bodenart",
        `„${bodenart}“ wurde nicht erkannt. Gültige Bodenarten (KA6-Code, z.B. Su2):\n\n${BODENART_HINT}`,
      );
    }
  }

  const result = useMemo(() => {
    const value = parseDecimal(valueStr);
    const opt = CHROMA_OPTIONS.find((o) => o.value === chroma);
    if (!opt || value === null) return null;
    const estimate = estimateHumusFromInputs(
      `${value}/${opt.chroma}`,
      phStr,
      clayStr,
    );
    if (!estimate) return null;
    return { ...estimate, ...humusKlasse(estimate.pct) };
  }, [valueStr, chroma, phStr, clayStr]);

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.toolContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Munsell Farbe ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.sectionTitle}>Munsell Farbe (feucht)</Text>

          <Text style={styles.fieldLabel}>Chroma</Text>
          <ChoiceChips
            choices={CHROMA_OPTIONS}
            value={chroma}
            onChange={setChroma}
          />

          <Text style={[styles.fieldLabel, localStyles.gapAbove]}>Value</Text>
          <Text style={styles.hint}>Helligkeit 1 (dunkel) – 8 (hell)</Text>
          <ValidatedField
            keyboardType="decimal-pad"
            placeholder="z.B. 4"
            value={valueStr}
            onChangeText={setValueStr}
            validate={validateMunsellValue}
            fieldLabel="Munsell Value (feucht)"
          />
          <Button
            title="Bestimmungshilfe"
            style={localStyles.gapAbove}
            onPress={() => setActiveModal("farbe")}
          />
        </View>

        {/* ── Bodenart + Schätzung ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Bodenart</Text>
          <WithToolButton onPress={() => setActiveModal("bodenart")}>
            <ValidatedField
              placeholder="z.B. Su2"
              value={bodenart}
              onChangeText={setBodenart}
              validate={validateBodenart}
              fieldLabel="Bodenart"
            />
          </WithToolButton>
        </View>

        {/* ── Tongehalt ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Tongehalt (%)</Text>
          <WithToolButton
            label="Aus BA abschätzen"
            onPress={estimateClayFromBodenart}
          >
            <ValidatedField
              keyboardType="decimal-pad"
              placeholder="z.B. 17"
              value={clayStr}
              onChangeText={setClayStr}
              validate={validateTonanteil}
              fieldLabel="Tongehalt (%)"
            />
          </WithToolButton>
          {clayRange && (
            <Text style={styles.hint}>
              KA6-Bereich: {clayRange.min}–{clayRange.max} %
            </Text>
          )}
        </View>

        {/* ── pH ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>pH (CaCl₂)</Text>
          <ValidatedField
            keyboardType="decimal-pad"
            placeholder="z.B. 5.5"
            value={phStr}
            onChangeText={setPhStr}
            validate={validatePh}
            fieldLabel="pH (CaCl₂)"
          />
        </View>

        {/* ── Result ── */}
        <View style={styles.resultBox}>
          {result ? (
            <>
              <Text style={styles.resultValue}>{result.pct} %</Text>
              <Text style={styles.resultLabel}>
                {result.klasse} — {result.label}
              </Text>
              {result.clamped && (
                <Text style={styles.hint}>
                  Eingabe außerhalb des Diagramms – Wert am Rand abgelesen
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.resultPlaceholder}>Alle Felder ausfüllen</Text>
          )}
        </View>

        {onConfirm && result && (
          <Button
            title={`Wert übernehmen (${result.klasse})`}
            onPress={() => onConfirm(String(result.pct))}
          />
        )}
      </ScrollView>

      {/* ── Farbe modal ── */}
      <ToolModal
        visible={activeModal === "farbe"}
        onClose={() => setActiveModal(null)}
        padded
      >
        <PictureTaker
          onConfirm={(munsell) => {
            const parsed = parseMunsell(munsell);
            if (parsed) {
              setValueStr(String(parsed.value));
              setChroma(chromaToClass(parsed.chroma));
            }
            setActiveModal(null);
          }}
        />
      </ToolModal>

      {/* ── Bodenart modal ── */}
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
    </>
  );
}

const localStyles = StyleSheet.create({
  gapAbove: {
    marginTop: spacing.sm,
  },
});
