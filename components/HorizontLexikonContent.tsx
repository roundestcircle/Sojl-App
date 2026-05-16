import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/styles/colors";
import { styles as globalStyles } from "@/styles/styles";
import {
  HORIZON_SECTIONS,
  type HorizonEntry,
  type HorizonSection,
} from "@/utils/horizonData";
import LexikonContent from "@/components/LexikonContent";

/**
 * Reusable search + SectionList dictionary for all horizon symbols.
 * Backed by the shared `LexikonContent` shell.
 */
export default function HorizontLexikonContent() {
  return (
    <LexikonContent<HorizonEntry, HorizonSection>
      sections={HORIZON_SECTIONS}
      keyExtractor={(item, index) => `${item.symbol}-${index}`}
      filterItem={(item, q) =>
        item.symbol.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      }
      renderItem={(item) => (
        <View style={localStyles.row}>
          <Text style={localStyles.symbol}>{item.symbol}</Text>
          <Text style={localStyles.description}>{item.description}</Text>
        </View>
      )}
      searchPlaceholder="Symbol oder Beschreibung suchen…"
      emptyContent={
        <>
          <Text style={globalStyles.emptyText}>Keine Einträge gefunden.</Text>
          <Text style={globalStyles.emptyText}>
            Das bedeutet nicht dass dein gesuchter Horizont nicht existiert.
            Dies ist nur eine kleine Horizontauswahl. Schau mal in der KA6 nach.
          </Text>
        </>
      }
    />
  );
}

const localStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  symbol: {
    minWidth: 60,
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
