import { View, Text, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Button from "@/components/ui/Button";
import { colors, fontSize } from "@/styles/theme";

export default function AufnahmeRedirectScreen() {
  const { title } = useLocalSearchParams<{ title?: string }>();

  return (
    <View style={localStyles.container}>
      <Text style={localStyles.heading}>{title ?? "Berechnung"}</Text>
      <Text style={localStyles.body}>
        Diese Berechnung ist nur innerhalb einer Aufnahme möglich. Starte eine
        Kartierung, um diese Funktion zu nutzen.
      </Text>
      <Button
        title="Zur Kartierung"
        style={{ alignSelf: "stretch" }}
        onPress={() => router.replace("/mapping")}
      />
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
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.primary,
    textAlign: "center",
  },
  body: {
    fontSize: fontSize.base,
    color: colors.textBody,
    textAlign: "center",
    lineHeight: 24,
  },
});
