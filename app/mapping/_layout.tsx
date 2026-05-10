import { colors } from "@/styles/colors";
import { Stack } from "expo-router";

export default function MappingLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold', fontSize: 25 },
    }}>
      <Stack.Screen name="index" options={{ title: 'Feldkampagnen' }} />
      <Stack.Screen name="session/[sessionId]" options={{ title: 'Kampagne' }} />
      <Stack.Screen name="soilmapping" options={{ title: 'Neue Aufnahme' }} />
      <Stack.Screen name="[id]/HorizonOverview" options={{ title: 'Horizonte' }} />
      <Stack.Screen name="[id]/horizon/[nr]" options={{ title: 'Horizont' }} />
    </Stack>
  );
}
