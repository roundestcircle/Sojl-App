import { View } from "react-native";
import SoilShareScroll from "@/components/tools/SoilShareScroll";
import { spacing } from "@/styles/theme";

/** Standalone screen wrapper for the coarse fraction share (Anteil) estimation tool. */
export default function AnteilScreen() {
  return (
    <View style={{ flex: 1, paddingHorizontal: spacing.screen }}>
      <SoilShareScroll />
    </View>
  );
}
