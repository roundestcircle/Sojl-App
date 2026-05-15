import { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, TextInput, SectionList, StyleSheet } from "react-native";
import { styles as globalStyles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  HUMUSFORM_SECTIONS,
  type HumusformSection,
  type HumusformEntry,
} from "@/utils/humusformData";

export default function HumusformLexikonContent() {
  const [query, setQuery] = useState("");
  const listRef = useRef<SectionList<HumusformEntry>>(null);

  const filtered: HumusformSection[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HUMUSFORM_SECTIONS;
    return HUMUSFORM_SECTIONS.map((section) => ({
      ...section,
      data: section.data.filter((e) => {
        if (e.kind === "symbol") {
          return (
            e.symbol.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q)
          );
        }
        return (
          e.body.toLowerCase().includes(q) ||
          (e.horizonSequence?.toLowerCase().includes(q) ?? false)
        );
      }),
    })).filter((s) => s.data.length > 0);
  }, [query]);

  useEffect(() => {
    if (filtered.length > 0) {
      listRef.current?.scrollToLocation({
        sectionIndex: 0,
        itemIndex: 0,
        animated: false,
        viewOffset: 0,
      });
    }
  }, [filtered]);

  const renderItem = ({ item }: { item: HumusformEntry }) => {
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
  };

  const renderSectionHeader = ({ section }: { section: HumusformSection }) => (
    <View style={localStyles.sectionHeader}>
      <Text style={globalStyles.sectionTitle}>{section.title}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={localStyles.searchContainer}>
        <TextInput
          style={[globalStyles.input, { marginBottom: 0 }]}
          placeholder="Humusform oder Begriff suchen…"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
      </View>

      <SectionList
        ref={listRef}
        sections={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{ paddingBottom: 30 }}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        extraData={query}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 20, paddingTop: 40 }}>
            <Text style={globalStyles.emptyText}>Keine Einträge gefunden.</Text>
          </View>
        }
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
  },
  sectionHeader: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
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
