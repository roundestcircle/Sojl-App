import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import ValidatedField from "@/components/ui/ValidatedField";
import { ToolModal } from "@/components/ui/ToolModal";
import {
  validateTonanteil,
  validatePh,
  validateBodenart,
  validateMunsellValue,
} from "@/lib/validation/fieldValidation";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
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
const CHROMA_OPTIONS: {
  label: string;
  value: ChromaClass;
  sub: string;
  chroma: number;
}[] = [
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
  const [bodenartError, setBodenartError] = useState(false);
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
      setBodenartError(true);
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
        contentContainerStyle={localStyles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Munsell Farbe ── */}
        <View style={localStyles.fieldGroup}>
          <Text style={localStyles.label}>Munsell Farbe (feucht)</Text>

          <Text style={localStyles.subLabel}>Chroma</Text>
          <View style={localStyles.chromaRow}>
            {CHROMA_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  localStyles.chromaBtn,
                  chroma === opt.value && localStyles.chromaBtnActive,
                ]}
                onPress={() => setChroma(opt.value)}
              >
                <Text
                  style={[
                    localStyles.chromaBtnText,
                    chroma === opt.value && localStyles.chromaBtnTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
                <Text
                  style={[
                    localStyles.chromaBtnSub,
                    chroma === opt.value && localStyles.chromaBtnTextActive,
                  ]}
                >
                  {opt.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[localStyles.subLabel, { marginTop: 8 }]}>Value</Text>
          <Text style={localStyles.hint}>Helligkeit 1 (dunkel) – 8 (hell)</Text>
          <ValidatedField
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="z.B. 4"
            placeholderTextColor={colors.primary + "66"}
            value={valueStr}
            onChangeText={setValueStr}
            validate={validateMunsellValue}
            fieldLabel="Munsell Value (feucht)"
          />
          <TouchableOpacity
            style={[styles.actionButton, localStyles.toolBtn, { marginTop: 8 }]}
            onPress={() => setActiveModal("farbe")}
          >
            <Text style={styles.actionButtonText}>Bestimmungshilfe</Text>
          </TouchableOpacity>
        </View>

        {/* ── Bodenart + Schätzung ── */}
        <View style={localStyles.fieldGroup}>
          <Text style={localStyles.label}>Bodenart</Text>
          <View style={localStyles.fieldWithTool}>
            <ValidatedField
              style={[styles.input, { flex: 1 }]}
              placeholder="z.B. Su2"
              placeholderTextColor={colors.primary + "66"}
              value={bodenart}
              onChangeText={setBodenart}
              validate={validateBodenart}
              fieldLabel="Bodenart"
            />
            <TouchableOpacity
              style={[styles.actionButton, localStyles.halfRowBtn]}
              onPress={() => setActiveModal("bodenart")}
            >
              <Text style={styles.actionButtonText}>Bestimmungshilfe</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Tongehalt ── */}
        <View style={localStyles.fieldGroup}>
          <Text style={localStyles.label}>Tongehalt (%)</Text>
          <View style={localStyles.fieldWithTool}>
            <ValidatedField
              style={[styles.input, { flex: 1 }]}
              keyboardType="decimal-pad"
              placeholder="z.B. 17"
              placeholderTextColor={colors.primary + "66"}
              value={clayStr}
              onChangeText={setClayStr}
              validate={validateTonanteil}
              fieldLabel="Tongehalt (%)"
            />
            <TouchableOpacity
              style={[styles.actionButton, localStyles.halfRowBtn]}
              onPress={estimateClayFromBodenart}
            >
              <Text style={styles.actionButtonText}>Aus BA abschätzen</Text>
            </TouchableOpacity>
          </View>
          {clayRange && (
            <Text style={localStyles.hint}>
              KA6-Bereich: {clayRange.min}–{clayRange.max} %
            </Text>
          )}
        </View>

        {/* ── pH ── */}
        <View style={localStyles.fieldGroup}>
          <Text style={localStyles.label}>pH (CaCl₂)</Text>
          <ValidatedField
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="z.B. 5.5"
            placeholderTextColor={colors.primary + "66"}
            value={phStr}
            onChangeText={setPhStr}
            validate={validatePh}
            fieldLabel="pH (CaCl₂)"
          />
        </View>

        {/* ── Result ── */}
        {result ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultValue}>{result.pct} %</Text>
            <Text style={styles.resultLabel}>
              {result.klasse} — {result.label}
            </Text>
            {result.clamped && (
              <Text style={localStyles.hint}>
                Eingabe außerhalb des Diagramms – Wert am Rand abgelesen
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.resultBox}>
            <Text style={styles.resultPlaceholder}>Alle Felder ausfüllen</Text>
          </View>
        )}

        {/* ── Confirm ── */}
        {onConfirm && result && (
          <TouchableOpacity
            style={[
              styles.actionButton,
              { alignSelf: "stretch", marginTop: 8 },
            ]}
            onPress={() => onConfirm(String(result.pct))}
          >
            <Text style={styles.actionButtonText}>
              Wert übernehmen ({result.klasse})
            </Text>
          </TouchableOpacity>
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

      <Modal
        visible={bodenartError}
        animationType="fade"
        transparent
        onRequestClose={() => setBodenartError(false)}
      >
        <View style={localStyles.modalOverlay}>
          <SafeAreaView style={localStyles.modalCard}>
            <Text style={localStyles.modalTitle}>Ungültige Bodenart</Text>
            <Text style={localStyles.modalBody}>
              „{bodenart}“ wurde nicht erkannt. Gültige Bodenarten (KA6-Code,
              z.B. Su2):
            </Text>
            <Text style={localStyles.modalList}>{BODENART_HINT}</Text>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { alignSelf: "stretch", marginTop: 12 },
              ]}
              onPress={() => setBodenartError(false)}
            >
              <Text style={styles.actionButtonText}>OK</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
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
  subLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.primary,
  },
  hint: {
    fontSize: 12,
    color: "#888",
  },
  chromaRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  chromaBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primary + "55",
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
    gap: 2,
  },
  chromaBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chromaBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  chromaBtnSub: {
    fontSize: 10,
    color: colors.primary + "99",
  },
  chromaBtnTextActive: {
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 32,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.primary,
  },
  modalBody: {
    fontSize: 14,
    color: "#333",
  },
  modalList: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    lineHeight: 22,
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
  halfRowBtn: {
    width: 150,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
});
