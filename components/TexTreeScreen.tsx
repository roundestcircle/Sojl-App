import { colors } from '@/styles/colors';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../styles/styles';
import { SoilTexTree } from '../utils/SoilTexTree';
import { InstructionModal, ResetInstructionButton } from '@/components/InstructionModal';

export default function TexTreeScreen() {
  const [currentNode, setCurrentNode] = useState(SoilTexTree.id);
  const [history, setHistory] = useState<string[]>([]);
  const [modalKey, setModalKey] = useState(0); // for resetting modal

  const getNode = (id: string) => {
    if (id === SoilTexTree.id) return SoilTexTree;
    return SoilTexTree.nodes[id as keyof typeof SoilTexTree.nodes];
  };

  const node = getNode(currentNode);

  const handlePress = (nextId: string) => {
    setHistory([...history, currentNode]);
    setCurrentNode(nextId);
  };

  const handleBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const previousNode = newHistory.pop()!;
      setHistory(newHistory);
      setCurrentNode(previousNode);
    }
  };

  const handleReset = () => {
    setModalKey(prev => prev + 1);
  };

  const isResult = 'result' in node;

  return (
    <View style={styles.container}>
      {/* Instruction Modal */}
      <InstructionModal
        key={modalKey}
        title="Anleitung"
        instructionText="Nimm eine Murmelgroße Bodenprobe, feuchte sie an und knete sie gut durch. Beantworte die Fragen, um die Bodenart zu bestimmen."
        storageKey="soilTexDontShowAgain" // use a unique key for this screen
      />

      <Text style={[styles.maintext, { position: 'absolute', top: 20 }]}>
        {node.question}
      </Text>

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

      {isResult && 'result' in node && (
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 25,
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

      {history.length > 0 && (
        <TouchableOpacity
          style={[styles.button, { position: 'absolute', bottom: 70 }]}
          onPress={handleBack}
        >
          <Text style={styles.maintext}>Zurück</Text>
        </TouchableOpacity>
      )}

      {history.length > 0 && isResult === true && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setCurrentNode(SoilTexTree.id);
            setHistory([]);
          }}
        >
          <Text style={styles.maintext}>Neu Starten</Text>
        </TouchableOpacity>
      )}

      {/* Reset instruction button */}
      <ResetInstructionButton
        storageKey="soilTexDontShowAgain"
        onReset={handleReset}
      />
    </View>
  );
}