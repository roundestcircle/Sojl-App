import { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  InstructionModal,
  ResetInstructionButton,
} from "@/components/InstructionModal";
import SoilShareScroll from "@/components/SoilShareScroll";
import {
  PACKUNGSDICHTE_QUESTIONS,
  makroporenPercentToOptionIndex,
  scorePackungsdichte,
  type PackungsdichteAnswer,
} from "@/utils/PackungsdichteScoring";

type Props = { onConfirm?: (code: string) => void };

/**
 * Five-question Packungsdichte (Pd) classifier per KA6 Tabelle C47.
 *
 * Walks through Wurzelverteilung → Lagerungsart → Makroporen → Aggregatgröße →
 * Verfestigung sequentially. Each question may be skipped. After the last
 * question the weighted score is computed and the resulting Pd-class shown.
 * Navigation mirrors DecisionTree (Zurück / Neu Starten / Wert übernehmen).
 *
 * The Makroporen question additionally offers a SoilShareScroll-based estimator
 * that converts an estimated area fraction (%) into the matching answer option.
 */
export default function PackungsdichteTool({ onConfirm }: Props) {
  const [answers, setAnswers] = useState<PackungsdichteAnswer[]>(() =>
    PACKUNGSDICHTE_QUESTIONS.map(() => ({ optionIndex: null })),
  );
  // Step counter: 0..N-1 is a question, N is the result screen
  const [step, setStep] = useState(0);
  const [modalKey, setModalKey] = useState(0);
  // SoilShareScroll fullscreen modal for the Makroporen step
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const totalSteps = PACKUNGSDICHTE_QUESTIONS.length;
  const isResult = step === totalSteps;
  const question = isResult ? null : PACKUNGSDICHTE_QUESTIONS[step];
  const isMakroporen = question?.id === "makroporen";

  const select = (optionIndex: number | null) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = { optionIndex };
      return next;
    });
    setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const restart = () => {
    setAnswers(PACKUNGSDICHTE_QUESTIONS.map(() => ({ optionIndex: null })));
    setStep(0);
  };

  const result = isResult ? scorePackungsdichte(answers) : null;

  return (
    <View style={{ flex: 1 }}>
      <InstructionModal
        key={modalKey}
        title="Anleitung"
        instructionText="Beantworte die fünf Fragen zur Packungsdichte (KA6, Tabelle C47). Jede Frage kann übersprungen werden. Die Wurzelverteilung wird am stärksten gewichtet, die Verfestigung am schwächsten. Beim Flächenanteil der Makroporen kannst du zusätzlich den Anteil schätzen lassen. Am Ende wird die wahrscheinlichste Packungsdichteklasse (Pd1–Pd5) angezeigt."
        storageKey="packungsdichteDontShowAgain"
      />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100,
          alignItems: "center",
          gap: 10,
        }}
      >
        {/* Progress indicator */}
        <Text style={{ color: "#888", fontSize: 13 }}>
          {isResult ? "Ergebnis" : `Frage ${step + 1} / ${totalSteps}`}
        </Text>

        {/* Question */}
        {question && (
          <>
            <Text style={[styles.maintext, { textAlign: "center" }]}>
              {question.title}
            </Text>
            {question.hint && (
              <Text
                style={{
                  fontSize: 12,
                  color: "#888",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                {question.hint}
              </Text>
            )}

            {/* Makroporen-only: estimator button that opens SoilShareScroll */}
            {isMakroporen && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { alignSelf: "stretch", marginTop: 4 },
                ]}
                onPress={() => setShareModalOpen(true)}
              >
                <Text style={styles.actionButtonText}>
                  Anteil schätzen (Scrollen)
                </Text>
              </TouchableOpacity>
            )}

            <View style={{ gap: 10, alignSelf: "stretch", marginTop: 6 }}>
              {question.options.map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.button, { alignItems: "flex-start" }]}
                  onPress={() => select(idx)}
                >
                  <Text style={styles.maintext}>{opt.label}</Text>
                  {opt.description && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#555",
                        marginTop: 4,
                      }}
                    >
                      {opt.description}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.button,
                  { borderStyle: "dashed", backgroundColor: "transparent" },
                ]}
                onPress={() => select(null)}
              >
                <Text style={[styles.maintext, { color: colors.primary }]}>
                  Überspringen
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Result */}
        {result && (
          <>
            <View
              style={[
                styles.resultBox,
                { alignSelf: "stretch", padding: 20, marginTop: 10 },
              ]}
            >
              {result.pdClass ? (
                <>
                  <Text style={styles.resultValue}>{result.label}</Text>
                  <Text style={styles.resultLabel}>Packungsdichte (KA6)</Text>
                </>
              ) : (
                <Text style={styles.resultLabel}>
                  Keine Frage beantwortet – bitte mindestens eine Antwort wählen.
                </Text>
              )}
            </View>

            {/* Per-class score breakdown for transparency */}
            {result.pdClass && (
              <View
                style={{
                  alignSelf: "stretch",
                  marginTop: 12,
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: "#f5f5f5",
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 13, color: "#555", fontWeight: "600" }}>
                  Punkte je Klasse:
                </Text>
                {result.scores.map((s, i) => (
                  <Text key={i} style={{ fontSize: 13, color: "#555" }}>
                    Pd{i + 1}: {s.toFixed(1)}
                  </Text>
                ))}
              </View>
            )}

            {result.pdClass && onConfirm && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { alignSelf: "stretch", marginTop: 16 },
                ]}
                onPress={() => onConfirm(result.code)}
              >
                <Text style={styles.actionButtonText}>Wert übernehmen</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, { marginTop: 16 }]}
              onPress={restart}
            >
              <Text style={styles.maintext}>Neu Starten</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Back button (available on every step except the first question) */}
        {step > 0 && (
          <TouchableOpacity
            style={[styles.button, { marginTop: 12 }]}
            onPress={goBack}
          >
            <Text style={styles.maintext}>Zurück</Text>
          </TouchableOpacity>
        )}

        <ResetInstructionButton
          storageKey="packungsdichteDontShowAgain"
          onReset={() => setModalKey((prev) => prev + 1)}
        />
      </ScrollView>

      {/* Fullscreen SoilShareScroll estimator for the Makroporen step. */}
      <Modal
        visible={shareModalOpen}
        animationType="slide"
        onRequestClose={() => setShareModalOpen(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <TouchableOpacity onPress={() => setShareModalOpen(false)}>
              <Text
                style={{ color: colors.primary, fontSize: 16, fontWeight: "600" }}
              >
                ✕ Schließen
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <SoilShareScroll
              onConfirm={(percent) => {
                const pct = parseFloat(percent);
                if (!isNaN(pct)) {
                  select(makroporenPercentToOptionIndex(pct));
                }
                setShareModalOpen(false);
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
