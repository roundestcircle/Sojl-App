import { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from "react-native";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { haversineMeters, bearingDegrees, angleDelta } from "@/lib/geo/geo";
import { useLiveLocation } from "@/hooks/useLiveLocation";

// Duration of the animated catch-up to each new arrow angle.
const ROTATE_DURATION_MS = 120;

type Props = {
  visible: boolean;
  onClose: () => void;
  target: { lat: number; lon: number };
};

/** Formats a distance in metres as "X m" (<1 km) or "X.X km". */
function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, localStyles.content]}>
          <Text style={styles.modalTitle}>Ort finden</Text>

          {error != null ? (
            <Text style={styles.modalText}>{error}</Text>
          ) : pos == null ? (
            <View style={localStyles.spinner}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.rowSub}>Standort wird ermittelt …</Text>
            </View>
          ) : (
            <>
              {heading != null ? (
                <Animated.Text
                  style={[localStyles.arrow, { transform: [{ rotate }] }]}
                >
                  ↑
                </Animated.Text>
              ) : (
                <Text style={styles.rowSub}>Kompass nicht verfügbar</Text>
              )}
              <Text style={localStyles.distance}>
                {distance != null ? formatDistance(distance) : "—"}
              </Text>
            </>
          )}

          <TouchableOpacity
            style={[styles.actionButton, localStyles.closeBtn]}
            onPress={onClose}
          >
            <Text style={styles.actionButtonText}>Schließen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  content: {
    alignItems: "center",
  },
  spinner: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 30,
  },
  arrow: {
    fontSize: 120,
    color: colors.primary,
    lineHeight: 130,
  },
  distance: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 8,
  },
  closeBtn: {
    marginTop: 20,
    alignSelf: "stretch",
  },
});
