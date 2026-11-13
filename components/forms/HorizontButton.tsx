import { useEffect, useRef, useState } from "react";
import { Animated, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/styles/theme";
import type { Horizont } from "@/lib/db/horizontQueries";
import NavRow, { rowTitleStyle } from "@/components/ui/NavRow";
import StatusBadge from "@/components/ui/StatusBadge";

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
 * Shows up/down reorder controls and the horizon number + optional name on the
 * left, and its status badge on the right.
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
  const label =
    `H${horizont.nummer}` +
    (horizont.horizontname ? ` – ${horizont.horizontname}` : "");

  // ── Label crossfade ──
  // The outgoing label is rendered as an overlay on top of the current one; we
  // hold it opaque, then fade it out while the current label fades in.
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const [newOpacity] = useState(() => new Animated.Value(1));
  const [oldOpacity] = useState(() => new Animated.Value(0));
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
    <NavRow
      onPress={onPress}
      onLongPress={onLongPress}
      leading={
        <View style={localStyles.reorder}>
          <ReorderArrow direction="up" enabled={canMoveUp} onPress={onMoveUp} />
          <ReorderArrow
            direction="down"
            enabled={canMoveDown}
            onPress={onMoveDown}
          />
        </View>
      }
      title={
        <View style={localStyles.nameWrap}>
          <Animated.Text
            style={[rowTitleStyle, { opacity: newOpacity }]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>
          {outgoing !== null && (
            <Animated.Text
              style={[
                rowTitleStyle,
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
      }
      badge={<StatusBadge status={horizont.status} />}
    />
  );
}

/** ▲/▼ control that moves the Horizont one position. */
function ReorderArrow({
  direction,
  enabled,
  onPress,
}: {
  direction: "up" | "down";
  enabled: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      style={localStyles.arrowButton}
      onPress={onPress}
      disabled={!enabled}
      hitSlop={6}
      accessibilityLabel={`Horizont nach ${direction === "up" ? "oben" : "unten"} verschieben`}
    >
      <Ionicons
        name={direction === "up" ? "chevron-up" : "chevron-down"}
        size={22}
        color={enabled ? colors.primary : colors.disabled}
      />
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  nameWrap: {
    flex: 1,
  },
  nameOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  reorder: {
    justifyContent: "center",
  },
  arrowButton: {
    paddingHorizontal: 2,
  },
});
