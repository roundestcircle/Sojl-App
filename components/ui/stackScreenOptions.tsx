import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/styles/theme";

/** Home icon rendered in the header's right slot; jumps back to the start screen. */
export function HomeButton() {
  return (
    <TouchableOpacity
      onPress={() => router.replace("/")}
      style={{ marginRight: 4 }}
      accessibilityRole="button"
      accessibilityLabel="Startseite"
    >
      <Ionicons name="home" size={24} color={colors.white} />
    </TouchableOpacity>
  );
}

/** Header styling shared by the root, /mapping and /tools stack navigators. */
export const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: "bold" as const, fontSize: 25 },
  headerRight: HomeButton,
};
