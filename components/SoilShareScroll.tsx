import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { Canvas, Rect } from '@shopify/react-native-skia';
import { styles } from '../styles/styles';
import { InstructionModal, ResetInstructionButton } from './InstructionModal';

// Get screen dimensions for responsive layout
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Maximum number of squares to render (limits grid size)
const TOTAL = 1000;

/**
 * Seeded pseudo-random number generator
 * Uses Linear Congruential Generator algorithm for deterministic randomness
 * Returns values between 0 and 1
 * This ensures the square grid layout is reproducible/consistent
 */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function SoilShareScroll() {
  // Track the percentage of visible squares (0-100%)
  const [percent, setPercent] = useState(0);
  
  // Key to force remount of InstructionModal after reset
  // Used to trigger modal re-display when user clicks reset button
  const [modalKey, setModalKey] = useState(0);

  /**
   * Memoized squares grid calculation
   * Computes positions and sizes of all black squares to fill the entire screen
   * Only recalculates when dependencies change (currently no dependencies)
   */
  const squares = useMemo(() => {
    const rand = seededRandom(42); // Fixed seed for reproducible layout
    
    // Calculate responsive cell size
    // Uses 80% of the smaller screen dimension divided into 15 cells
    const targetGridWidth = Math.min(SCREEN_W, SCREEN_H) * 0.8;
    const cellSize = Math.floor(targetGridWidth / 15);
    
    // Calculate grid dimensions based on screen size and cell size
    const cols = Math.ceil(SCREEN_W / cellSize);
    const rows = Math.ceil(SCREEN_H / cellSize);
    
    // Limit total squares to TOTAL constant while filling the available grid
    const squaresToCreate = Math.min(TOTAL, cols * rows);
    
    // Squares are 80% of cell size for visual spacing
    const squareSize = cellSize;
    
    // Create initial square positions in a grid pattern
    const squareArray = Array.from({ length: squaresToCreate }).map((_, i) => {
      const col = i % cols; // Column index (left to right)
      const row = Math.floor(i / cols); // Row index (top to bottom)
      const cellX = col * cellSize; // Grid position
      const cellY = row * cellSize;
      const offset = (cellSize - squareSize) / 2; // Center square within cell
      return {
        x: cellX + offset, // Final X position
        y: cellY + offset, // Final Y position
        size: squareSize,
      };
    });
    
    // Shuffle the squares array using Fisher-Yates algorithm
    // This randomizes which squares become visible as user scrolls
    for (let i = squareArray.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [squareArray[i], squareArray[j]] = [squareArray[j], squareArray[i]];
    }
    return squareArray;
  }, []);

  // Calculate how many squares should be visible based on current scroll percentage
  const visibleCount = Math.round((percent / 100) * squares.length);

  // Handler to reset the instruction modal display
  const handleReset = () => {
    // Force InstructionModal to remount by changing its key
    setModalKey(prev => prev + 1);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Instruction modal that explains how to use the component */}
      <InstructionModal
        key={modalKey} // remount when key changes to reset shown state
        title="Anleitung"
        instructionText="Der Prozentcounter in der Mitte zeigt dir den Anteil an schwarzen Pixeln. Vergleich ihn mit dem Anteil deiner zu analysierenden Komponente. Scrolle um den Anteil zu erhöhen."
        storageKey="soilShareDontShowAgain"
      />

      {/* Canvas rendering the black squares grid */}
      {/* Positioned absolutely to fill the entire screen */}
      <Canvas style={StyleSheet.absoluteFill}>
        {squares.map((sq, i) => (
          <Rect
            key={i}
            x={sq.x}
            y={sq.y}
            width={sq.size}
            height={sq.size}
            color="black"
            // Square is visible if its index is less than the calculated visible count
            opacity={i < visibleCount ? 1 : 0}
          />
        ))}
      </Canvas>

      {/* Percentage display overlay in the center of the screen */}
      <View style={styles.labelContainer} pointerEvents="none">
        <View style={styles.button}>
          <Text style={styles.label}>{percent}%</Text>
        </View>
      </View>

      {/* Invisible scrollable area that triggers percentage updates */}
      {/* Height is 5x screen height to allow scrolling from 0% to 100% */}
      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={{ height: SCREEN_H * 5 }}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          // Extract scroll metrics from event
          const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
          // Calculate maximum scrollable distance
          const maxScroll = contentSize.height - layoutMeasurement.height;
          // Calculate current scroll percentage (0-100)
          const pct = Math.round((contentOffset.y / maxScroll) * 100);
          // Update percentage, clamped between 0 and 100
          setPercent(Math.min(100, Math.max(0, pct)));
        }}
        scrollEventThrottle={16} // Update frequency: 16ms throttle (~60fps)
      />

      {/* Button to reset instruction modal visibility */}
      <ResetInstructionButton
        storageKey="soilShareDontShowAgain"
        onReset={handleReset}
        style={{ alignSelf: 'stretch', width: 'auto', marginTop: 20, bottom: 15, left: 0, right: 0 }}
      />
    </View>
  );
}