import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";

export default function AufnahmeRedirectScreen() {
  const { title } = useLocalSearchParams<{ title?: string }>();

  return (
    <View style={localStyles.container}>
      <Text style={localStyles.heading}>{title ?? "Berechnung"}</Text>
      <Text style={localStyles.body}>
        Diese Berechnung ist nur innerhalb einer Aufnahme möglich. Starte eine
        Kartierung, um diese Funktion zu nutzen.
      </Text>
      <TouchableOpacity
        style={[styles.actionButton, { alignSelf: "stretch" }]}
        onPress={() => router.replace("/mapping")}
      >
        <Text style={styles.actionButtonText}>Zur Kartierung</Text>
      </TouchableOpacity>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 28,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },
  body: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    lineHeight: 24,
  },
});
