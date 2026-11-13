import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { styles } from "@/styles/styles";
import { colors, fontSize, radius, spacing } from "@/styles/theme";
import Button from "@/components/ui/Button";
import { HelpButton, useInstruction } from "@/components/ui/Instruction";
import { ToolModal } from "@/components/ui/ToolModal";
import SoilShareScroll from "@/components/tools/SoilShareScroll";
import { parseDecimal } from "@/lib/number";
import {
  PACKUNGSDICHTE_QUESTIONS,
  makroporenPercentToOptionIndex,
  scorePackungsdichte,
  type PackungsdichteAnswer,
} from "@/lib/calc/packungsdichteScoring";

type Props = { onConfirm?: (code: string) => void };

const INSTRUCTION =
  "Beantworte die fünf Fragen zur Packungsdichte (KA6, Tabelle C47). Jede Frage kann übersprungen werden. Die Wurzelverteilung wird am stärksten gewichtet, die Verfestigung am schwächsten. Beim Flächenanteil der Makroporen kannst du zusätzlich den Anteil schätzen lassen. Am Ende wird die wahrscheinlichste Packungsdichteklasse (Pd1–Pd5) angezeigt.";

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
  const instruction = useInstruction(
    "packungsdichteDontShowAgain",
    INSTRUCTION,
  );
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
      {instruction.modal}

      <ScrollView contentContainerStyle={localStyles.content}>
        <Text style={[styles.hint, localStyles.center]}>
          {isResult ? "Ergebnis" : `Frage ${step + 1} / ${totalSteps}`}
        </Text>

        {question && (
          <>
            <Text style={[styles.title, localStyles.center]}>
              {question.title}
            </Text>
            {question.hint && (
              <Text style={[styles.hint, localStyles.center]}>
                {question.hint}
              </Text>
            )}

            {/* Makroporen-only: estimator button that opens SoilShareScroll */}
            {isMakroporen && (
              <Button
                title="Anteil schätzen (Scrollen)"
                onPress={() => setShareModalOpen(true)}
              />
            )}

            {question.options.map((opt, idx) => (
              <Button
                key={idx}
                title={opt.label}
                description={opt.description}
                variant="outline"
                align="left"
                onPress={() => select(idx)}
              />
            ))}
            <Button
              title="Überspringen"
              variant="outline"
              style={localStyles.skip}
              onPress={() => select(null)}
            />
          </>
        )}

        {result && (
          <>
            <View style={[styles.resultBox, localStyles.result]}>
              {result.pdClass ? (
                <>
                  <Text style={styles.resultValue}>{result.label}</Text>
                  <Text style={styles.resultLabel}>Packungsdichte (KA6)</Text>
                </>
              ) : (
                <Text style={styles.resultLabel}>
                  Keine Frage beantwortet – bitte mindestens eine Antwort
                  wählen.
                </Text>
              )}
            </View>

            {/* Per-class score breakdown for transparency */}
            {result.pdClass && (
              <View style={localStyles.scores}>
                <Text style={[localStyles.scoreText, { fontWeight: "600" }]}>
                  Punkte je Klasse:
                </Text>
                {result.scores.map((s, i) => (
                  <Text key={i} style={localStyles.scoreText}>
                    Pd{i + 1}: {s.toFixed(1)}
                  </Text>
                ))}
              </View>
            )}

            {result.pdClass && onConfirm && (
              <Button
                title="Wert übernehmen"
                onPress={() => onConfirm(result.code)}
              />
            )}

            <Button title="Neu starten" variant="outline" onPress={restart} />
          </>
        )}
      </ScrollView>

      {/* ── Pinned bottom bar: Zurück + Anleitung ── */}
      <View style={[styles.bottomBar, localStyles.footer]}>
        {step > 0 && (
          <Button
            title="Zurück"
            icon="arrow-back"
            variant="outline"
            style={localStyles.grow}
            onPress={goBack}
          />
        )}
        <HelpButton onPress={instruction.show} />
      </View>

      {/* Fullscreen SoilShareScroll estimator for the Makroporen step. */}
      <ToolModal
        visible={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        padded
      >
        <SoilShareScroll
          onConfirm={(percent) => {
            const pct = parseDecimal(percent);
            if (pct !== null) {
              select(makroporenPercentToOptionIndex(pct));
            }
            setShareModalOpen(false);
          }}
        />
      </ToolModal>
    </View>
  );
}

const localStyles = StyleSheet.create({
  content: {
    padding: spacing.screen,
    paddingBottom: spacing.xl,
    gap: 10,
  },
  center: {
    textAlign: "center",
  },
  skip: {
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  result: {
    padding: 20,
  },
  scores: {
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    gap: spacing.xs,
  },
  scoreText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  grow: {
    flex: 1,
  },
});
