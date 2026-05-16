import { useState, useMemo } from "react";
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
import {
  validateTonanteil,
  validatePh,
  validateBodenart,
  validateMunsellValue,
} from "@/utils/fieldValidation";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import PictureTaker from "@/components/PictureTaker";
import TexTree from "@/components/TexTree";
import {
  estimateHumus,
  humusKlasse,
  bodenartToClay,
  parseMunsell,
  chromaToClass,
  type ChromaClass,
} from "@/utils/renger1987";

type Props = {
  onConfirm?: (klasse: string, pct: string) => void;
  /** Pre-fill from HorizonForm: farbe_munsell string e.g. "10YR 4/3" */
  initialFarbeMunsell?: string;
  /** Pre-fill from HorizonForm: ph_cacl2 string */
  initialPH?: string;
  /** Pre-fill from HorizonForm: bodenart string e.g. "Su2" */
  initialBodenart?: string;
};

const CHROMA_OPTIONS: { label: string; value: ChromaClass; sub: string }[] = [
  { label: "> 6", value: "high", sub: "leuchtend" },
  { label: "3,5 – 6", value: "mid", sub: "mittel" },
  { label: "< 3,5", value: "low", sub: "matt / grau" },
];

function initFromMunsell(s?: string): {
  valueStr: string;
  chroma: ChromaClass | null;
} {
  if (!s) return { valueStr: "", chroma: null };
  const parsed = parseMunsell(s);
  if (!parsed) return { valueStr: "", chroma: null };
  return {
    valueStr: String(parsed.value),
    chroma: chromaToClass(parsed.chroma),
  };
}

export default function HumusgehaltTool({
  onConfirm,
  initialFarbeMunsell,
  initialPH,
  initialBodenart,
}: Props) {
  const { valueStr: initValue, chroma: initChroma } =
    initFromMunsell(initialFarbeMunsell);

  const [chroma, setChroma] = useState<ChromaClass | null>(initChroma);
  const [valueStr, setValueStr] = useState(initValue);
  const [bodenart, setBodenart] = useState(initialBodenart ?? "");
  const [clayStr, setClayStr] = useState("");
  const [phStr, setPhStr] = useState(initialPH ?? "");
  const [bodenartError, setBodenartError] = useState(false);
  const [activeModal, setActiveModal] = useState<"farbe" | "bodenart" | null>(null);

  function estimateClayFromBodenart() {
    const clay = bodenartToClay(bodenart);
    if (clay !== null) {
      setClayStr(String(clay));
    } else {
      setBodenartError(true);
    }
  }

  const result = useMemo(() => {
    const value = parseFloat(valueStr);
    const pH = parseFloat(phStr);
    const clay = parseFloat(clayStr);
    if (!chroma || isNaN(value) || isNaN(pH) || isNaN(clay)) return null;
    if (value < 1 || value > 8) return null;
    if (pH < 2 || pH > 9) return null;
    if (clay < 0 || clay > 100) return null;
    const humus = estimateHumus(value, chroma, pH, clay);
    return { humus, ...humusKlasse(humus) };
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
              onChangeText={(t) => {
                setBodenart(t);
              }}
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
          <View style={localStyles.rowWithBtn}>
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
            <Text style={styles.resultValue}>{result.humus} %</Text>
            <Text style={styles.resultLabel}>
              {result.klasse} — {result.label}
            </Text>
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
            onPress={() => onConfirm(result.klasse, String(result.humus))}
          >
            <Text style={styles.actionButtonText}>
              Wert übernehmen ({result.klasse})
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* ── Farbe modal ── */}
      <Modal
        visible={activeModal === "farbe"}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View style={localStyles.modalHeader}>
            <TouchableOpacity onPress={() => setActiveModal(null)}>
              <Text style={localStyles.modalClose}>✕ Schließen</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, padding: 20 }}>
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
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Bodenart modal ── */}
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
        visible={bodenartError}
        animationType="fade"
        transparent
        onRequestClose={() => setBodenartError(false)}
      >
        <View style={localStyles.modalOverlay}>
          <SafeAreaView style={localStyles.modalCard}>
            <Text style={localStyles.modalTitle}>Ungültige Bodenart</Text>
            <Text style={localStyles.modalBody}>
              „{bodenart}“ wurde nicht erkannt. Gültige Bodenarten (mit
              optionaler Nummer, z.B. Su2):
            </Text>
            <Text style={localStyles.modalList}>
              S, Su, U, Sl, Slu{"\n"}
              Us, Ut, St{"\n"}
              Ls, Lu{"\n"}
              Ts, Lts, Lt{"\n"}
              Tl, Tu, T
            </Text>
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
  rowWithBtn: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
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
