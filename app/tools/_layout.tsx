import { Stack } from "expo-router";
import { stackScreenOptions } from "@/components/ui/stackScreenOptions";

/**
 * Stack layout for the /tools section.
 * Registers all soil determination tool screens with a consistent header.
 */
export default function ToolsLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="index"
        options={{ title: "Kartierungsunterstützung" }}
      />
      <Stack.Screen name="bodenfarbe" options={{ title: "Bodenfarbe" }} />
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
