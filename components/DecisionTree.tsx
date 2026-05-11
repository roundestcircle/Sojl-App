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

export default function DecisionTree({ tree, onConfirm, instructionText, storageKey }: Props) {
  const [currentNode, setCurrentNode] = useState(tree.id);
  const [history, setHistory] = useState<string[]>([]);
  const [modalKey, setModalKey] = useState(0);

  const getNode = (id: string): TreeNode => {
    if (id === tree.id) return tree as TreeNode;
    return tree.nodes[id] ?? { id, question: '?', options: [] };
  };

  const node = getNode(currentNode);
  const isResult = 'result' in node;

  const handlePress = (nextId: string) => {
    setHistory([...history, currentNode]);
    setCurrentNode(nextId);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      setCurrentNode(newHistory.pop()!);
      setHistory(newHistory);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
      <InstructionModal
        key={modalKey}
        title="Anleitung"
        instructionText={instructionText}
        storageKey={storageKey}
      />

      <View style={{ position: 'absolute', top: 20, alignItems: 'center' }}>
        <Text style={styles.maintext}>{node.question}</Text>
        {'hint' in node && node.hint && (
          <Text style={{ fontSize: 12, color: '#888', marginTop: 6, textAlign: 'center' }}>
            {node.hint}
          </Text>
        )}
      </View>

      {!isResult && 'options' in node && (
        <View style={{ gap: 10 }}>
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

      {isResult && (
        <View style={{ backgroundColor: colors.primary, borderRadius: 10, padding: 20, gap: 10, minWidth: '100%' }}>
          <Text style={[styles.maintext, { textAlign: 'center', marginBottom: 40, marginTop: 40, color: '#fff' }]}>
            {(node as ResultNode).result.title}; {(node as ResultNode).result.description}
          </Text>
        </View>
      )}

      {history.length > 0 && (
        <TouchableOpacity
          style={[styles.button, { position: 'absolute', bottom: 70 }]}
          onPress={handleBack}
        >
          <Text style={styles.maintext}>Zurück</Text>
        </TouchableOpacity>
      )}

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
