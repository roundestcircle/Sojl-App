import { colors } from '@/styles/colors';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/styles';
import { SoilTexTree } from '../utils/SoilTexTree';
import { InstructionModal, ResetInstructionButton } from '@/components/InstructionModal';

type Props = { onConfirm?: (result: string) => void };

export default function TexTree({ onConfirm }: Props) {
  // Track the current position in the decision tree
  const [currentNode, setCurrentNode] = useState(SoilTexTree.id);
  
  // Store history of visited nodes to enable back navigation
  const [history, setHistory] = useState<string[]>([]);
  
  // Key to force remount of InstructionModal after reset
  const [modalKey, setModalKey] = useState(0);

  /**
   * Retrieves a node from the tree structure by its ID
   * @param id - The unique identifier of the node
   * @returns The node object containing question/options or result
   */
  const getNode = (id: string) => {
    if (id === SoilTexTree.id) return SoilTexTree; // Root node
    return SoilTexTree.nodes[id as keyof typeof SoilTexTree.nodes];
  };

  // Get the current node data to display
  const node = getNode(currentNode);

  /**
   * Navigates to the next node
   * Saves current node to history before moving forward
   * @param nextId - The ID of the next node to navigate to
   */
  const handlePress = (nextId: string) => {
    setHistory([...history, currentNode]); // Save current for back navigation
    setCurrentNode(nextId);
  };

  /**
   * Navigates back one step in the tree
   * Pops the last node from history and returns to it
   */
  const handleBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousNode = newHistory.pop()!; // Remove and get last node
      setHistory(newHistory);
      setCurrentNode(previousNode);
    }
  };

  /**
   * Resets the instruction modal to show again
   * Used when user clicks the reset instruction button
   */
  const handleReset = () => {
    setModalKey(prev => prev + 1);
  };

  // Check if current node is a result node (end of decision tree)
  const isResult = 'result' in node;

  return (
    <View style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
      {/* Instruction Modal - Displays usage instructions */}
      <InstructionModal
        key={modalKey} // Remount when key changes to reset shown state
        title="Anleitung"
        instructionText="Nimm eine Murmelgroße Bodenprobe, feuchte sie an und knete sie gut durch. Beantworte die Fragen, um die Bodenart zu bestimmen."
        storageKey="soilTexDontShowAgain" // Unique storage key for this screen
      />

      {/* Display the current question at the top */}
      <Text style={[styles.maintext, { position: 'absolute', top: 20 }]}>
        {node.question}
      </Text>

      {/* Display answer options if current node is NOT a result */}
      {!isResult && 'options' in node && (
        <View style={{ gap: 10 }}>
          {/* Map through all available options for this question */}
          {node.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.button, { minWidth: '100%' }]}
              onPress={() => handlePress(option.next)} // Navigate to next node
            >
              <Text style={styles.maintext}>{option.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Display final result when decision tree is complete */}
      {isResult && 'result' in node && (
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 10,
            padding: 20,
            gap: 10,
            minWidth: '100%',
          }}
        >
          <Text
            style={[
              styles.maintext,
              { textAlign: 'center', marginBottom: 40, marginTop: 40, color: '#fff' },
            ]}
          >
            {node.result.title}; {node.result.description}
          </Text>
        </View>
      )}

      {/* Back button - Only visible if there's navigation history */}
      {history.length > 0 && (
        <TouchableOpacity
          style={[styles.button, { position: 'absolute', bottom: 70 }]}
          onPress={handleBack}
        >
          <Text style={styles.maintext}>Zurück</Text>
        </TouchableOpacity>
      )}

      {/* Confirm button – only shown when opened from the form */}
      {isResult && onConfirm && (
        <TouchableOpacity
          style={[styles.actionButton, { alignSelf: 'stretch', marginTop: 16 }]}
          onPress={() => onConfirm((node as any).result.title)}
        >
          <Text style={styles.actionButtonText}>Wert übernehmen</Text>
        </TouchableOpacity>
      )}

      {/* Restart button - Only visible after reaching a result */}
      {history.length > 0 && isResult === true && (
        <TouchableOpacity
          style={[styles.button, { marginTop: 16 }]}
          onPress={() => {
            setCurrentNode(SoilTexTree.id); // Reset to root node
            setHistory([]); // Clear history
          }}
        >
          <Text style={styles.maintext}>Neu Starten</Text>
        </TouchableOpacity>
      )}

      {/* Reset instruction button - Allows user to show instructions again */}
      <ResetInstructionButton
        storageKey="soilTexDontShowAgain"
        onReset={handleReset}
        style={{ alignSelf: 'stretch', width: 'auto', marginTop: 20, bottom: 15, left: 20, right: 20 }}
      />
    </View>
  );
}