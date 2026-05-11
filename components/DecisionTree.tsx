import { colors } from '@/styles/colors';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '@/styles/styles';
import { InstructionModal, ResetInstructionButton } from '@/components/InstructionModal';
import type { DecisionTreeData, ResultNode, TreeNode } from '@/utils/DecisionTreeTypes';

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
export default function DecisionTree({ tree, onConfirm, instructionText, storageKey }: Props) {
  // ID of the currently displayed node
  const [currentNode, setCurrentNode] = useState(tree.id);
  // Breadcrumb stack enabling the Back button to reverse navigation
  const [history, setHistory] = useState<string[]>([]);
  // Key to force remount of InstructionModal after user clicks "Anleitung erneut zeigen"
  const [modalKey, setModalKey] = useState(0);

  /**
   * Looks up a node by id.
   * The root node lives directly on the tree object rather than in nodes map,
   * so it needs a special-case check.
   */
  const getNode = (id: string): TreeNode => {
    if (id === tree.id) return tree as TreeNode;
    return tree.nodes[id] ?? { id, question: '?', options: [] };
  };

  const node = getNode(currentNode);
  const isResult = 'result' in node;

  /**
   * Navigates forward to a child node.
   * Pushes the current node id onto the history stack so the user can go back.
   */
  const handlePress = (nextId: string) => {
    setHistory([...history, currentNode]);
    setCurrentNode(nextId);
  };

  /**
   * Navigates back one step by popping the history stack.
   * No-op if already at the root.
   */
  const handleBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      setCurrentNode(newHistory.pop()!);
      setHistory(newHistory);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, alignItems: 'center' }}>
      <InstructionModal
        key={modalKey}
        title="Anleitung"
        instructionText={instructionText}
        storageKey={storageKey}
      />

      {/* ── Question text and optional hint ── */}
      <View style={{ alignItems: 'center', marginTop: 10, marginBottom: 16 }}>
        <Text style={styles.maintext}>{node.question}</Text>
        {'hint' in node && node.hint && (
          <Text style={{ fontSize: 12, color: '#888', marginTop: 6, textAlign: 'center' }}>
            {node.hint}
          </Text>
        )}
      </View>

      {/* ── Answer option buttons (only shown on inner nodes) ── */}
      {!isResult && 'options' in node && (
        <View style={{ gap: 10, alignSelf: 'stretch' }}>
          {node.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.button, { minWidth: '100%' }]}
              onPress={() => handlePress(option.next)}
            >
              <Text style={styles.maintext}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Result display (only shown on leaf nodes) ── */}
      {isResult && (
        <View style={{ backgroundColor: colors.primary, borderRadius: 10, padding: 20, gap: 10, minWidth: '100%' }}>
          <Text style={[styles.maintext, { textAlign: 'center', marginBottom: 40, marginTop: 40, color: '#fff' }]}>
            {(node as ResultNode).result.title}; {(node as ResultNode).result.description}
          </Text>
        </View>
      )}

      {/* ── Back navigation button ── */}
      {history.length > 0 && (
        <TouchableOpacity
          style={[styles.button, { position: 'absolute', bottom: 70 }]}
          onPress={handleBack}
        >
          <Text style={styles.maintext}>Zurück</Text>
        </TouchableOpacity>
      )}

      {/* ── Confirm and restart actions (result node only) ── */}
      {isResult && onConfirm && (
        <TouchableOpacity
          style={[styles.actionButton, { alignSelf: 'stretch', marginTop: 16 }]}
          onPress={() => onConfirm((node as ResultNode).result.title)}
        >
          <Text style={styles.actionButtonText}>Wert übernehmen</Text>
        </TouchableOpacity>
      )}

      {isResult && (
        <TouchableOpacity
          style={[styles.button, { marginTop: 16 }]}
          onPress={() => { setCurrentNode(tree.id); setHistory([]); }}
        >
          <Text style={styles.maintext}>Neu Starten</Text>
        </TouchableOpacity>
      )}

      <ResetInstructionButton
        storageKey={storageKey}
        onReset={() => setModalKey(prev => prev + 1)}
        style={{ alignSelf: 'stretch', width: 'auto', marginTop: 20, bottom: 15, left: 20, right: 20 }}
      />
    </View>
  );
}
