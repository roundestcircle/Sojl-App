import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { styles } from "@/styles/styles";
import { spacing } from "@/styles/theme";
import Button from "@/components/ui/Button";
import { HelpButton, useInstruction } from "@/components/ui/Instruction";
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
  const instruction = useInstruction(storageKey, instructionText);

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
      {instruction.modal}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={localStyles.content}
      >
        {/* ── Question text and optional hint ── */}
        <View style={localStyles.question}>
          <Text style={[styles.title, localStyles.centeredText]}>
            {node.question}
          </Text>
          {!isResultNode(node) && node.hint && (
            <Text style={[styles.hint, localStyles.centeredText]}>
              {node.hint}
            </Text>
          )}
        </View>

        {isResultNode(node) ? (
          <>
            <View style={[styles.resultBox, localStyles.result]}>
              <Text style={styles.resultValue}>{node.result.title}</Text>
              <Text style={styles.resultLabel}>{node.result.description}</Text>
            </View>

            {onConfirm && (
              <Button
                title="Wert übernehmen"
                onPress={() => onConfirm(node.result.title)}
              />
            )}

            <Button title="Neu starten" variant="outline" onPress={restart} />
          </>
        ) : (
          node.options.map((option) => (
            <Button
              key={option.next}
              title={option.text}
              variant="outline"
              onPress={() => goTo(option.next)}
            />
          ))
        )}
      </ScrollView>

      {/* ── Footer: Zurück + Anleitung (below the scrolling content) ── */}
      <View style={[styles.bottomBar, localStyles.footer]}>
        {path.length > 1 && (
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
    </View>
  );
}

const localStyles = StyleSheet.create({
  content: {
    padding: spacing.screen,
    gap: 10,
  },
  question: {
    alignItems: "center",
    gap: 6,
    marginVertical: spacing.sm,
  },
  centeredText: {
    textAlign: "center",
  },
  result: {
    padding: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  grow: {
    flex: 1,
  },
});
