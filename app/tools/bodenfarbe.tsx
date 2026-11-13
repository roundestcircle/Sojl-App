import { View } from "react-native";
import PictureTaker from "@/components/tools/PictureTaker";
import { spacing } from "@/styles/theme";

/**
 * Standalone soil color screen.
 * Hosts PictureTaker without the surrounding mapping workflow,
 * accessible directly from the home screen.
 */
export default function SoilColorScreen() {
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: spacing.screen,
        paddingVertical: spacing.md,
      }}
    >
      <PictureTaker />
    </View>
  );
}
