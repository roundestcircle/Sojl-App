import { Stack, router } from "expo-router";
import { View } from "react-native";
import Button from "@/components/ui/Button";
import { styles } from "@/styles/styles";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Seite nicht gefunden" }} />
      <View style={styles.centered}>
        <Button
          title="Zurück zum Startbildschirm"
          variant="outline"
          style={{ alignSelf: "stretch" }}
          onPress={() => router.replace("/")}
        />
      </View>
    </>
  );
}
