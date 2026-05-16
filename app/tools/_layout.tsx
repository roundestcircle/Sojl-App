import { Stack, router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/styles/colors";

/**
 * Stack layout for the /tools section.
 * Registers all soil determination tool screens with a consistent header.
 */
export default function ToolsLayout() {
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
      <Stack.Screen
        name="index"
        options={{ title: "Kartierungsunterstützung" }}
      />
      <Stack.Screen name="bodenart" options={{ title: "Bodenart" }} />
      <Stack.Screen name="anteil" options={{ title: "Anteil" }} />
      <Stack.Screen name="humusgehalt" options={{ title: "Humusgehalt" }} />
      <Stack.Screen name="carbonat" options={{ title: "Carbonatgehalt" }} />
      <Stack.Screen
        name="lagerungsdichte"
        options={{ title: "Lagerungsdichte (KA5)" }}
      />
      <Stack.Screen
        name="packungsdichte"
        options={{ title: "Packungsdichte (KA6)" }}
      />
      <Stack.Screen name="feinwurzeln" options={{ title: "Feinwurzeln" }} />
      <Stack.Screen name="gefuege" options={{ title: "Gefüge" }} />
      <Stack.Screen name="bodentyp" options={{ title: "Bodentyp" }} />
      <Stack.Screen name="horizonte" options={{ title: "Horizontsymbole" }} />
      <Stack.Screen name="humusformen" options={{ title: "Humusformen" }} />
      <Stack.Screen name="kak" options={{ title: "KAK berechnen" }} />
      <Stack.Screen
        name="basensaettigung"
        options={{ title: "Basensättigung berechnen" }}
      />
      <Stack.Screen
        name="aufnahme-redirect"
        options={{ title: "Aufnahme erforderlich" }}
      />
    </Stack>
  );
}
