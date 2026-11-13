import { View } from "react-native";
import BodenartTool from "@/components/tools/BodenartTool";

/** Standalone screen wrapper for the soil texture (Bodenart) determination tool. */
export default function BodenartScreen() {
  return (
    <View style={{ flex: 1 }}>
      <BodenartTool />
    </View>
  );
}
