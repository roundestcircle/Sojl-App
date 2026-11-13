import { router } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/styles/colors";

/** Home icon rendered in the header's right slot; jumps back to the start screen. */
export function HomeButton() {
  return (
    <TouchableOpacity
      onPress={() => router.replace("/")}
      style={{ marginRight: 4 }}
    >
      <Ionicons name="home" size={24} color="#fff" />
    </TouchableOpacity>
  );
}

/** Header styling shared by the root, /mapping and /tools stack navigators. */
export const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "bold" as const, fontSize: 25 },
  headerRight: HomeButton,
};
