import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Canvas, Rect } from "@shopify/react-native-skia";
import { styles } from "../styles/styles";
import { InstructionModal, ResetInstructionButton } from "./InstructionModal";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// Cap the rendered square count so very tall phones don't paint thousands of Rects.
const TOTAL = 1000;

/** Linear-congruential PRNG so the shuffle order is reproducible across mounts. */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

type Props = { onConfirm?: (percent: string) => void };

export default function SoilShareScroll({ onConfirm }: Props) {
  const [percent, setPercent] = useState(0);
  // Remount the InstructionModal to reset its "don't show again" state.
  const [modalKey, setModalKey] = useState(0);

  const squares = useMemo(() => {
    const rand = seededRandom(42);

    // Use 80 % of the smaller dimension as the visible play area, divided into 15 cells.
    const targetGridWidth = Math.min(SCREEN_W, SCREEN_H) * 0.8;
    const cellSize = Math.floor(targetGridWidth / 15);

    const cols = Math.ceil(SCREEN_W / cellSize);
    const rows = Math.ceil(SCREEN_H / cellSize);
    const squaresToCreate = Math.min(TOTAL, cols * rows);

    const squareArray = Array.from({ length: squaresToCreate }).map((_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        x: col * cellSize,
        y: row * cellSize,
        size: cellSize,
      };
    });

    // Fisher-Yates: randomize reveal order so the grid doesn't fill top-down.
    for (let i = squareArray.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [squareArray[i], squareArray[j]] = [squareArray[j], squareArray[i]];
    }
    return squareArray;
  }, []);

  const visibleCount = Math.round((percent / 100) * squares.length);

  const handleReset = () => {
    setModalKey((prev) => prev + 1);
  };

  return (
    <View style={{ flex: 1 }}>
      <InstructionModal
        key={modalKey}
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

      {/* Invisible scroll area 5× the screen height so scroll position maps to 0–100 %. */}
      <ScrollView
        style={StyleSheet.absoluteFill}
        contentContainerStyle={{ height: SCREEN_H * 5 }}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => {
          const { contentOffset, contentSize, layoutMeasurement } =
            e.nativeEvent;
          const maxScroll = contentSize.height - layoutMeasurement.height;
          const pct = Math.round((contentOffset.y / maxScroll) * 100);
          setPercent(Math.min(100, Math.max(0, pct)));
        }}
        scrollEventThrottle={16}
      />

      {/* Rendered after the ScrollView so the button still receives touches. */}
      {onConfirm && (
        <View style={{ position: "absolute", bottom: 80, left: 0, right: 0 }}>
          <TouchableOpacity
            style={[styles.actionButton, { alignSelf: "stretch" }]}
            onPress={() => onConfirm(String(percent))}
          >
            <Text style={styles.actionButtonText}>
              Wert übernehmen ({percent}%)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ResetInstructionButton
        storageKey="soilShareDontShowAgain"
        onReset={handleReset}
        style={{ position: "absolute", left: 0, right: 0, bottom: 16, paddingHorizontal: 0 }}
      />
    </View>
  );
}
