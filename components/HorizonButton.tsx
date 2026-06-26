import { useEffect, useRef, useState } from "react";
import {
  Animated,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { colors } from "@/styles/colors";
import { styles } from "@/styles/styles";
import type { Horizont } from "@/utils/HorizonQueries";
import Badge from "@/components/Badge";

const HOLD_MS = 600; // keep showing the old label before crossfading
const FADE_MS = 350; // crossfade duration

type Props = {
  horizont: Horizont;
  onPress: () => void;
  onLongPress?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  /**
   * Non-zero and bumped each time this row is involved in a move (moved or
   * swapped). Gates the label crossfade to reorder events so unrelated
   * re-renders (e.g. returning to the screen) don't animate.
   */
  moveNonce?: number;
};

/**
 * Renders a single row button for a Horizont.
 * Shows ▲/▼ reorder controls and the horizon number + optional name on the left,
 * and a colored status badge on the right.
 * When the row is reordered, its label holds the old value briefly and then
 * crossfades to the new one.
 * Long-press triggers deletion (handled by the parent screen).
 */
export default function HorizontButton({
  horizont,
  onPress,
  onLongPress,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  moveNonce = 0,
}: Props) {
  const { label: statusLabel, badgeBg } = statusStyle[horizont.status];

  const label =
    `H${horizont.nummer}` +
    (horizont.horizontname ? ` – ${horizont.horizontname}` : "");

  // ── Label crossfade ──
  // The outgoing label is rendered as an overlay on top of the current one; we
  // hold it opaque, then fade it out while the current label fades in.
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const newOpacity = useRef(new Animated.Value(1)).current;
  const oldOpacity = useRef(new Animated.Value(0)).current;
  const prevLabel = useRef(label);
  const prevNonce = useRef(moveNonce);

  useEffect(() => {
    const old = prevLabel.current;
    prevLabel.current = label; // keep current across every label change
    const isMove = moveNonce !== prevNonce.current && moveNonce !== 0;
    prevNonce.current = moveNonce;
    if (!isMove || old === label) return;

    setOutgoing(old);
    oldOpacity.setValue(1);
    newOpacity.setValue(0);
    Animated.sequence([
      Animated.delay(HOLD_MS),
      Animated.parallel([
        Animated.timing(oldOpacity, {
          toValue: 0,
          duration: FADE_MS,
          useNativeDriver: true,
        }),
        Animated.timing(newOpacity, {
          toValue: 1,
          duration: FADE_MS,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setOutgoing(null));
  }, [label, moveNonce, oldOpacity, newOpacity]);

  return (
    <TouchableOpacity
      style={localStyles.button}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      <View style={localStyles.reorder}>
        <TouchableOpacity
          style={localStyles.arrowButton}
          onPress={onMoveUp}
          disabled={!canMoveUp}
          hitSlop={6}
          accessibilityLabel="Horizont nach oben verschieben"
        >
          <Text
            style={[localStyles.arrow, !canMoveUp && localStyles.arrowDisabled]}
          >
            ▲
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={localStyles.arrowButton}
          onPress={onMoveDown}
          disabled={!canMoveDown}
          hitSlop={6}
          accessibilityLabel="Horizont nach unten verschieben"
        >
          <Text
            style={[
              localStyles.arrow,
              !canMoveDown && localStyles.arrowDisabled,
            ]}
          >
            ▼
          </Text>
        </TouchableOpacity>
      </View>
      <View style={localStyles.nameWrap}>
        <Animated.Text
          style={[localStyles.name, { opacity: newOpacity }]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>
        {outgoing !== null && (
          <Animated.Text
            style={[
              localStyles.name,
              localStyles.nameOverlay,
              { opacity: oldOpacity },
            ]}
            numberOfLines={1}
            pointerEvents="none"
          >
            {outgoing}
          </Animated.Text>
        )}
      </View>
      <Badge label={statusLabel} color={badgeBg} />
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

// Maps each horizon status to a human-readable label and badge background color
const statusStyle: Record<
  Horizont["status"],
  { label: string; badgeBg: string }
> = {
  leer: { label: "leer", badgeBg: "#6c757d" },
  angefangen: { label: "begonnen", badgeBg: "#e0a020" },
  vollstaendig: { label: "vollständig", badgeBg: colors.primary },
};

const localStyles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  nameWrap: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  nameOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  reorder: {
    flexDirection: "column",
    justifyContent: "center",
  },
  arrowButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  arrow: {
    fontSize: 16,
    color: colors.primary,
  },
  arrowDisabled: {
    color: "#c4c4c4",
  },
});
