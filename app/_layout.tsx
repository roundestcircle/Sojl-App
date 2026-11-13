import { Stack } from "expo-router";
import { stackScreenOptions } from "@/components/ui/stackScreenOptions";

/**
 * Root layout for the whole app: defines the top-level navigation screens.
 * The SQLite schema is created when lib/db/db.ts is first imported.
 */
export default function RootLayout() {
  return (
    <Stack screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="index"
        options={{ title: "Home", headerRight: () => null }}
      />
      <Stack.Screen name="about" options={{ title: "About" }} />
      <Stack.Screen name="mapping" options={{ headerShown: false }} />
      <Stack.Screen name="tools" options={{ headerShown: false }} />
    </Stack>
  );
}
