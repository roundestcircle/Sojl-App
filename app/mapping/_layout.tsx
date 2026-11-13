import { Stack } from "expo-router";
import { stackScreenOptions } from "@/components/ui/stackScreenOptions";

/**
 * Stack layout for the /mapping section.
 * Registers all mapping screens with a consistent green header and home button.
 */
export default function MappingLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
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
        name="[aufnahmeId]/horizont/[nr]"
        options={{ title: "Horizont" }}
      />
    </Stack>
  );
}
