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
import * as Location from "expo-location";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import { haversineMeters, bearingDegrees, smoothHeading } from "@/utils/geo";

// Exponential smoothing factor for the heading (moderate: steady but responsive).
const HEADING_SMOOTHING = 0.15;
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
 * live distance to it. Uses the device GPS position and heading; both
 * subscriptions are torn down when the modal closes or unmounts.
 */
export default function OrtFindenModal({ visible, onClose, target }: Props) {
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null);
  const [hasHeading, setHasHeading] = useState(false);
  const [denied, setDenied] = useState(false);

  const posSub = useRef<Location.LocationSubscription | null>(null);
  const headingSub = useRef<Location.LocationSubscription | null>(null);

  // Latest values read by updateArrow without forcing a re-render on every tick.
  const posRef = useRef<{ lat: number; lon: number } | null>(null);
  const headingRef = useRef<number | null>(null);
  const targetRef = useRef(target);
  targetRef.current = target;

  // Continuous (unwrapped) arrow angle so animations always take the short path.
  const rotAnim = useRef(new Animated.Value(0)).current;
  const rotValueRef = useRef(0);

  // Recomputes the desired arrow angle from the latest position + heading and
  // animates toward it along the shortest rotational path.
  const updateArrow = useRef(() => {
    const p = posRef.current;
    const h = headingRef.current;
    if (p == null || h == null) return;
    const t = targetRef.current;
    const bearing = bearingDegrees(p.lat, p.lon, t.lat, t.lon);
    // Arrow points at the target relative to where the device faces.
    const desired = bearing - h;
    // Shortest signed step from the current unwrapped angle to `desired`.
    const delta = ((desired - rotValueRef.current + 540) % 360) - 180;
    rotValueRef.current += delta;
    Animated.timing(rotAnim, {
      toValue: rotValueRef.current,
      duration: ROTATE_DURATION_MS,
      useNativeDriver: true,
    }).start();
  }).current;

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== "granted") {
        setDenied(true);
        return;
      }
      setDenied(false);
      const sub = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1 },
        (loc) => {
          posRef.current = {
            lat: loc.coords.latitude,
            lon: loc.coords.longitude,
          };
          setPos(posRef.current);
          updateArrow();
        },
      );
      // The modal may have closed while the watch was being set up; if so, tear
      // it straight back down instead of leaking the subscription.
      if (cancelled) {
        sub.remove();
        return;
      }
      posSub.current = sub;
      const hSub = await Location.watchHeadingAsync((h) => {
        // trueHeading is -1 when unavailable; fall back to magnetic heading.
        const raw = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
        headingRef.current = smoothHeading(
          headingRef.current,
          raw,
          HEADING_SMOOTHING,
        );
        if (!cancelled) setHasHeading(true);
        updateArrow();
      });
      if (cancelled) {
        hSub.remove();
        return;
      }
      headingSub.current = hSub;
    };

    start();

    return () => {
      cancelled = true;
      posSub.current?.remove();
      posSub.current = null;
      headingSub.current?.remove();
      headingSub.current = null;
      posRef.current = null;
      headingRef.current = null;
      rotValueRef.current = 0;
      rotAnim.setValue(0);
      setPos(null);
      setHasHeading(false);
    };
  }, [visible, updateArrow, rotAnim]);

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

          {denied ? (
            <Text style={styles.modalText}>
              Standortzugriff wurde verweigert. Bitte erlaube den Zugriff in den
              Einstellungen.
            </Text>
          ) : pos == null ? (
            <View style={localStyles.spinner}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.rowSub}>Standort wird ermittelt …</Text>
            </View>
          ) : (
            <>
              <Animated.Text
                style={[localStyles.arrow, { transform: [{ rotate }] }]}
              >
                ↑
              </Animated.Text>
              <Text style={localStyles.distance}>
                {distance != null ? formatDistance(distance) : "—"}
              </Text>
              {!hasHeading && (
                <Text style={styles.rowSub}>Kompass nicht verfügbar</Text>
              )}
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
