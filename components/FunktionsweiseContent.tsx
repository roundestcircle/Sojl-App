import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "@/styles/colors";
import {
  FUNKTIONSWEISE_SECTIONS,
  type FunktionsweiseEntry,
  type FunktionsweiseSection,
} from "@/utils/funktionsweiseData";
import LexikonContent from "@/components/LexikonContent";

export default function FunktionsweiseContent() {
  return (
    <LexikonContent<FunktionsweiseEntry, FunktionsweiseSection>
      sections={FUNKTIONSWEISE_SECTIONS}
      keyExtractor={(item, index) => `${item.title}-${index}`}
      filterItem={(item, q) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      }
      renderItem={(item) => (
        <View style={localStyles.row}>
          <Text style={localStyles.title}>{item.title}</Text>
          <Text style={localStyles.description}>{item.description}</Text>
          {item.image != null && (
            <Image
              source={item.image}
              style={localStyles.image}
              resizeMode="contain"
            />
          )}
        </View>
      )}
      searchPlaceholder="Tool suchen…"
    />
  );
}

const localStyles = StyleSheet.create({
  row: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  description: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  image: {
    width: "100%",
    height: 180,
    marginTop: 8,
  },
});
