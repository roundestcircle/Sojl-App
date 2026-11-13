import { View } from "react-native";
import PackungsdichteTool from "@/components/tools/PackungsdichteTool";

/** Standalone screen wrapper for the Packungsdichte (KA6) determination tool. */
export default function PackungsdichteScreen() {
  return (
    <View style={{ flex: 1 }}>
      <PackungsdichteTool />
    </View>
  );
}
