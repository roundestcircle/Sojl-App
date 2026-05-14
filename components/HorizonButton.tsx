import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { colors } from "@/styles/colors";
import { styles } from "@/styles/styles";
import type { Horizont } from "@/utils/HorizonQueries";

type Props = {
  horizont: Horizont;
  onPress: () => void;
  onLongPress?: () => void;
};

/**
 * Renders a single row button for a Horizont.
 * Shows the horizon number + optional name on the left and a colored status badge on the right.
 * Long-press triggers deletion (handled by the parent screen).
 */
export default function HorizontButton({
  horizont,
  onPress,
  onLongPress,
}: Props) {
  const { label, badgeBg } = statusStyle[horizont.status];

  return (
    <TouchableOpacity
      style={localStyles.button}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
    >
      <Text style={localStyles.name}>
        H{horizont.nummer}
        {horizont.horizontname ? ` – ${horizont.horizontname}` : ""}
      </Text>
      <View style={[styles.badge, { backgroundColor: badgeBg }]}>
        <Text style={styles.badgeText}>{label}</Text>
      </View>
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
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
});
