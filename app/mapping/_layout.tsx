import { colors } from "@/styles/colors";
import { Stack, router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Stack layout for the /mapping section.
 * Registers all mapping screens with a consistent green header and home button.
 */
export default function MappingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold", fontSize: 25 },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.replace("/")}
            style={{ marginRight: 4 }}
          >
            <Ionicons name="home" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Feldkampagnen" }} />
      <Stack.Screen
        name="kampagne/[kampagneId]/index"
        options={{ title: "Kampagne" }}
      />
      <Stack.Screen name="[aufnahmeId]/index" options={{ title: "Aufnahme" }} />
      <Stack.Screen
        name="[aufnahmeId]/standort"
        options={{ title: "Standortdaten" }}
      />
      <Stack.Screen
        name="[aufnahmeId]/horizon/[nr]"
        options={{ title: "Horizont" }}
      />
    </Stack>
  );
}
