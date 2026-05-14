import { View } from "react-native";
import TexTree from "@/components/TexTree";

/** Standalone screen wrapper for the soil texture (Bodenart) determination tool. */
export default function BodenartScreen() {
  return (
    <View style={{ flex: 1 }}>
      <TexTree />
    </View>
  );
}
