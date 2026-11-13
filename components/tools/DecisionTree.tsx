import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "@/styles/styles";
import {
  InstructionModal,
  ResetInstructionButton,
} from "@/components/ui/InstructionModal";
import {
  isResultNode,
  type DecisionTreeData,
  type TreeNode,
} from "@/data/trees/types";

type Props = {
  tree: DecisionTreeData;
  onConfirm?: (result: string) => void;
  instructionText: string;
  storageKey: string;
};

/**
 * Generic guided decision-tree navigator.
 * Walks any DecisionTreeData from root to a result node based on user choices,
 * then surfaces the result title via the optional onConfirm callback.
 */
export default function DecisionTree({
  tree,
  onConfirm,
  instructionText,
  storageKey,
}: Props) {
  // Visited node ids from the root to the current node; the last one is shown.
  const [path, setPath] = useState<string[]>([tree.root]);
  // Key to force remount of InstructionModal after user clicks "Anleitung erneut zeigen"
  const [modalKey, setModalKey] = useState(0);

  const currentId = path[path.length - 1];
  const node: TreeNode = tree.nodes[currentId] ?? {
    // Malformed tree (caught by data/trees/__tests__); show a stub, not a crash.
    question: `Knoten "${currentId}" fehlt.`,
    options: [],
  };

  const goTo = (nextId: string) => setPath((p) => [...p, nextId]);
  const goBack = () => setPath((p) => (p.length > 1 ? p.slice(0, -1) : p));
  const restart = () => setPath([tree.root]);

  return (
    <View style={{ flex: 1 }}>
      <InstructionModal
        key={modalKey}
        title="Anleitung"
        instructionText={instructionText}
        storageKey={storageKey}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, alignItems: "center" }}
      >
        {/* ── Question text and optional hint ── */}
        <View style={{ alignItems: "center", marginTop: 10, marginBottom: 16 }}>
          <Text style={styles.maintext}>{node.question}</Text>
          {!isResultNode(node) && node.hint && (
            <Text
              style={{
                fontSize: 12,
                color: "#888",
                marginTop: 6,
                textAlign: "center",
              }}
            >
              {node.hint}
            </Text>
          )}
        </View>

        {isResultNode(node) ? (
          <>
            {/* ── Result display ── */}
            <View
              style={[
                styles.resultBox,
                { alignSelf: "stretch", padding: 20, marginTop: 10 },
              ]}
            >
              <Text style={styles.resultValue}>{node.result.title}</Text>
              <Text style={styles.resultLabel}>{node.result.description}</Text>
            </View>

            {onConfirm && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { alignSelf: "stretch", marginTop: 16 },
                ]}
                onPress={() => onConfirm(node.result.title)}
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
        ) : (
          /* ── Answer option buttons ── */
          <View style={{ gap: 10, alignSelf: "stretch" }}>
            {node.options.map((option) => (
              <TouchableOpacity
                key={option.next}
                style={styles.button}
                onPress={() => goTo(option.next)}
              >
                <Text style={styles.maintext}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Footer: Zurück + Anleitung (below the scrolling content) ── */}
      <View style={styles.bottomBar}>
        {path.length > 1 && (
          <TouchableOpacity style={styles.button} onPress={goBack}>
            <Text style={styles.maintext}>Zurück</Text>
          </TouchableOpacity>
        )}
        <ResetInstructionButton
          storageKey={storageKey}
          onReset={() => setModalKey((prev) => prev + 1)}
          style={{ position: "relative", alignSelf: "stretch" }}
        />
      </View>
    </View>
  );
}
