import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { colors } from "@/styles/colors";
import type { Horizont } from "@/utils/HorizonQueries";

type Props = {
  horizont: Horizont;
  onPress: () => void;
};

/**
 * HorizontButton
 *
 * Displays a single horizon as a tappable button.
 * Color reflects completion status:
 *   leer          → grey   (not started)
 *   angefangen    → amber  (in progress)
 *   vollstaendig  → green  (complete)
 */
export default function HorizontButton({ horizont, onPress }: Props) {
  const { label, bg, text } = statusStyle[horizont.status];

  return (
    <TouchableOpacity
      style={[localStyles.button, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[localStyles.number, { color: text }]}>
        H{horizont.nummer}{horizont.horizontname ? ` – ${horizont.horizontname}` : ""}
      </Text>
      <View style={[localStyles.badge, { borderColor: text }]}>
        <Text style={[localStyles.badgeText, { color: text }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Status styles ─────────────────────────────────────────────────────────────

const statusStyle: Record<
  Horizont["status"],
  { label: string; bg: string; text: string }
> = {
  leer: {
    label: "leer",
    bg: "#e0e0e0",
    text: "#555555",
  },
  angefangen: {
    label: "angefangen",
    bg: "#fff3cd",
    text: "#856404",
  },
  vollstaendig: {
    label: "vollständig",
    bg: "#d1e7dd",
    text: "#0f5132",
  },
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const localStyles = StyleSheet.create({
  button: {
    flex: 1,
    minWidth: "40%",
    borderRadius: 10,
    borderWidth: 5,
    borderColor: colors.primary,
    padding: 18,
    alignItems: "center",
    gap: 8,
  },
  number: {
    fontSize: 26,
    fontWeight: "700",
  },
  badge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});