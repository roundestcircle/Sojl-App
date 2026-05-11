import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { colors } from "@/styles/colors";
import type { Horizont } from "@/utils/HorizonQueries";

type Props = {
  horizont: Horizont;
  onPress: () => void;
};

export default function HorizontButton({ horizont, onPress }: Props) {
  const { label, badgeBg } = statusStyle[horizont.status];

  return (
    <TouchableOpacity
      style={localStyles.button}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={localStyles.name}>
        H{horizont.nummer}{horizont.horizontname ? ` – ${horizont.horizontname}` : ""}
      </Text>
      <View style={[localStyles.badge, { backgroundColor: badgeBg }]}>
        <Text style={localStyles.badgeText}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const statusStyle: Record<Horizont["status"], { label: string; badgeBg: string }> = {
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
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
