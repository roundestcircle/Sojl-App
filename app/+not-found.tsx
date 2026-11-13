import { Link, Stack } from "expo-router";
import { View } from "react-native";
import { styles } from "@/styles/styles";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Seite nicht gefunden" }} />
      <View style={styles.container}>
        <Link href="/" style={styles.button}>
          Zurück zum Startbildschirm
        </Link>
      </View>
    </>
  );
}
