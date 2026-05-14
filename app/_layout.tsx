import { colors } from "@/styles/colors";
import { Stack, router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { initDatabase } from "@/utils/db";

// Home icon rendered in the header right slot on most screens
const homeButton = () => (
  <TouchableOpacity
    onPress={() => router.replace("/")}
    style={{ marginRight: 4 }}
  >
    <Ionicons name="home" size={24} color="#fff" />
  </TouchableOpacity>
);

/**
 * Root layout for the whole app.
 * Initializes the SQLite database on first render and defines top-level navigation screens.
 */
export default function RootLayout() {
  initDatabase();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold", fontSize: 25 },
        headerRight: homeButton,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Home", headerRight: () => null }}
      />
      <Stack.Screen name="about" options={{ title: "About" }} />
      <Stack.Screen name="soilcolor" options={{ title: "Bodenfarbe" }} />
      <Stack.Screen name="mapping" options={{ headerShown: false }} />
      <Stack.Screen name="tools" options={{ headerShown: false }} />
    </Stack>
  );
}
