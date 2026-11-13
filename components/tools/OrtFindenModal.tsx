import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/styles/styles";
import { colors, fontSize, spacing } from "@/styles/theme";
import Dialog, { dialogText } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import {
  haversineMeters,
  bearingDegrees,
  angleDelta,
  formatDistance,
} from "@/lib/geo/geo";
import { useLiveLocation } from "@/hooks/useLiveLocation";

// Duration of the animated catch-up to each new arrow angle.
const ROTATE_DURATION_MS = 120;

type Props = {
  visible: boolean;
  onClose: () => void;
  target: { lat: number; lon: number };
};

/**
 * Full-screen overlay that points a compass arrow toward `target` and shows the
 * live distance to it. Position and heading come from `useLiveLocation`, which
 * tears its subscriptions down when the modal closes or unmounts.
 */
export default function OrtFindenModal({ visible, onClose, target }: Props) {
  const { pos, heading, error } = useLiveLocation(visible);

  // Continuous (unwrapped) arrow angle so animations always take the short path.
  const [rotAnim] = useState(() => new Animated.Value(0));
  const rotValueRef = useRef(0);

  // Re-aim the arrow at the target relative to where the device faces,
  // animating along the shortest rotational path.
  useEffect(() => {
    if (pos == null || heading == null) return;
    const desired =
      bearingDegrees(pos.lat, pos.lon, target.lat, target.lon) - heading;
    rotValueRef.current += angleDelta(rotValueRef.current, desired);
    Animated.timing(rotAnim, {
      toValue: rotValueRef.current,
      duration: ROTATE_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }, [pos, heading, target.lat, target.lon, rotAnim]);

  // Reset the arrow when the modal closes.
  useEffect(() => {
    if (visible) return;
    rotValueRef.current = 0;
    rotAnim.setValue(0);
  }, [visible, rotAnim]);

  const distance =
    pos != null
      ? haversineMeters(pos.lat, pos.lon, target.lat, target.lon)
      : null;
  // Identity mapping (value in degrees → "<value>deg"); extends past the range.
  const rotate = rotAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Dialog visible={visible} onClose={onClose} title="Ort finden">
      <View style={localStyles.content}>
        {error != null ? (
          <Text style={dialogText}>{error}</Text>
        ) : pos == null ? (
          <View style={localStyles.spinner}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.hint}>Standort wird ermittelt …</Text>
          </View>
        ) : (
          <>
            {heading != null ? (
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons
                  name="arrow-up"
                  size={120}
                  color={colors.primary}
                  accessibilityLabel="Richtung zum Ziel"
                />
              </Animated.View>
            ) : (
              <Text style={styles.hint}>Kompass nicht verfügbar</Text>
            )}
            <Text style={localStyles.distance}>
              {distance != null ? formatDistance(distance) : "–"}
            </Text>
          </>
        )}
      </View>

      <Button title="Schließen" onPress={onClose} />
    </Dialog>
  );
}

const localStyles = StyleSheet.create({
  content: {
    alignItems: "center",
  },
  spinner: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 30,
  },
  distance: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.primary,
    marginTop: spacing.sm,
  },
});
