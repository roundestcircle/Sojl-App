import { View, Text, StyleSheet } from "react-native";
import { colors } from "@/styles/colors";

type Props = {
  status: "offen" | "abgeschlossen";
};

export default function StatusBadge({ status }: Props) {
  return (
    <View style={[localStyles.badge, { backgroundColor: status === "abgeschlossen" ? colors.primary : "#e0a020" }]}>
      <Text style={localStyles.text}>
        {status === "abgeschlossen" ? "abgeschlossen" : "offen"}
      </Text>
    </View>
  );
}

const localStyles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});
