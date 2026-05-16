import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/styles/colors";
import {
  HUMUSFORM_SECTIONS,
  type HumusformEntry,
  type HumusformSection,
} from "@/utils/humusformData";
import LexikonContent from "@/components/LexikonContent";

export default function HumusformLexikonContent() {
  return (
    <LexikonContent<HumusformEntry, HumusformSection>
      sections={HUMUSFORM_SECTIONS}
      keyExtractor={(item) => item.id}
      filterItem={(item, q) => {
        if (item.kind === "symbol") {
          return (
            item.symbol.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)
          );
        }
        return (
          item.body.toLowerCase().includes(q) ||
          (item.horizonSequence?.toLowerCase().includes(q) ?? false)
        );
      }}
      renderItem={(item) => {
        if (item.kind === "symbol") {
          return (
            <View style={localStyles.symbolRow}>
              <Text style={localStyles.symbol}>{item.symbol}</Text>
              <Text style={localStyles.description}>{item.description}</Text>
            </View>
          );
        }
        return (
          <View style={localStyles.paragraphRow}>
            {item.horizonSequence && (
              <Text style={localStyles.horizonSequence}>
                {item.horizonSequence}
              </Text>
            )}
            <Text style={localStyles.body}>{item.body}</Text>
          </View>
        );
      }}
      searchPlaceholder="Humusform oder Begriff suchen…"
    />
  );
}

const localStyles = StyleSheet.create({
  paragraphRow: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  horizonSequence: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 2,
  },
  body: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  symbolRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  symbol: {
    minWidth: 70,
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  description: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});
