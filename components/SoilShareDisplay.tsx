import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { Canvas, Rect } from '@shopify/react-native-skia';
import { styles } from '../styles/styles';
import { InstructionModal, ResetInstructionButton } from './InstructionModal';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const TOTAL = 1000;
const PAD = 16;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function SoilShareDisplay() {
  const [percent, setPercent] = useState(0);
  // Key to force remount of InstructionModal after reset
  const [modalKey, setModalKey] = useState(0);

  const squares = useMemo(() => {
    const rand = seededRandom(42);
    const cellSize = 25;
    const cols = Math.ceil((SCREEN_W - PAD * 2) / cellSize);
    const rows = Math.ceil((SCREEN_H - PAD * 2) / cellSize);
    const squaresToCreate = Math.min(TOTAL, cols * rows);
    const squareSize = 25;
    
    const squareArray = Array.from({ length: squaresToCreate }).map((_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cellX = PAD + col * cellSize;
      const cellY = PAD + row * cellSize;
      const offset = (cellSize - squareSize) / 2;
      return {
        x: cellX + offset,
        y: cellY + offset,
        size: squareSize,
      };
    });
    
    for (let i = squareArray.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [squareArray[i], squareArray[j]] = [squareArray[j], squareArray[i]];
    }
    return squareArray;
  }, []);

  const visibleCount = Math.round((percent / 100) * squares.length);

  const handleReset = () => {
    // Force InstructionModal to remount by changing its key
    setModalKey(prev => prev + 1);
  };

  return (
    <View style={{ flex: 1 }}>
      <InstructionModal
        key={modalKey} // remount when key changes
        title="Anleitung"
        instructionText="Der Prozentcounter in der Mitte zeigt dir den Anteil an schwarzen Pixeln. Vergleich ihn mit dem Anteil deiner zu analysierenden Komponente. Scrolle um den Anteil zu erhöhen."
        storageKey="soilShareDontShowAgain"
      />

      <Canvas style={StyleSheet.absoluteFill}>
        {squares.map((sq, i) => (
          <Rect
            key={i}
            x={sq.x}
            y={sq.y}
            width={sq.size}
            height={sq.size}
            color="black"
            opacity={i < visibleCount ? 1 : 0}
          />
        ))}
      </Canvas>

      <View style={styles.labelContainer} pointerEvents="none">
        <View style={styles.button}>
          <Text style={styles.label}>{percent}%</Text>
        </View>
      </View>

      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={{ height: SCREEN_H * 5 }}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
          const maxScroll = contentSize.height - layoutMeasurement.height;
          const pct = Math.round((contentOffset.y / maxScroll) * 100);
          setPercent(Math.min(100, Math.max(0, pct)));
        }}
        scrollEventThrottle={16}
      />

      <ResetInstructionButton
        storageKey="soilShareDontShowAgain"
        onReset={handleReset}
        style={{ alignSelf: 'stretch', width: 'auto', marginTop: 20, bottom: 15, left: 0, right: 0 }}
      />
    </View>
  );
}