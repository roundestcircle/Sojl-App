import { View } from "react-native";
import FeinwurzelnTool from "@/components/FeinwurzelnTool";

/** Standalone screen wrapper for the fine root intensity (Feinwurzeln) determination tool. */
export default function FeinwurzelnScreen() {
  return (
    <View style={{ flex: 1 }}>
      <FeinwurzelnTool />
    </View>
  );
}
