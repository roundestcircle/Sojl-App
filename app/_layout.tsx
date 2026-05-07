import { colors } from "@/styles/colors";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: { backgroundColor: colors.primary },
      headerTintColor: '#fff',
      headerTitleStyle: { fontWeight: 'bold', fontSize: 25},
    }}>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
      <Stack.Screen name="soilcolor" options={{ title: 'Bodenfarbe' }} />
      <Stack.Screen name="soilmapping" options={{ title: 'Kartierung' }} />
      <Stack.Screen name="soiltexture" options={{ title: 'Bodenart' }} />
      <Stack.Screen name="soilshare" options={{ title: 'Anteil' }} />
    </Stack>
  );
}
