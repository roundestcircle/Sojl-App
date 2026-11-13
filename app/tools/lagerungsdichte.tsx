import { View } from "react-native";
import LagerungsdichteTool from "@/components/tools/LagerungsdichteTool";

/** Standalone screen wrapper for the Lagerungsdichte determination tool. */
export default function LagerungsdichteScreen() {
  return (
    <View style={{ flex: 1 }}>
      <LagerungsdichteTool />
    </View>
  );
}
