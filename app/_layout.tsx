import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
      <Stack.Screen name="soilcolor" options={{ title: 'Soilcolor' }} />
      <Stack.Screen name="soilmapping" options={{ title: 'Soilmapping' }} />
      <Stack.Screen name="soiltexture" options={{ title: 'Soiltexture' }} />
    </Stack>
  );
}
