import { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, TextInput, SectionList, StyleSheet } from "react-native";
import { styles as globalStyles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import {
  HORIZON_SECTIONS,
  type HorizonSection,
  type HorizonEntry,
} from "@/utils/horizonData";

/**
 * Reusable search + SectionList dictionary for all horizon symbols.
 * Manages its own query state; safe to embed in a Modal or a full screen.
 */
export default function HorizontLexikonContent() {
  const [query, setQuery] = useState("");
  const listRef = useRef<SectionList<HorizonEntry>>(null);

  const filtered: HorizonSection[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HORIZON_SECTIONS;
    return HORIZON_SECTIONS.map((section) => ({
      ...section,
      data: section.data.filter(
        (e) =>
          e.symbol.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q),
      ),
    })).filter((section) => section.data.length > 0);
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

  const renderItem = ({ item }: { item: HorizonEntry }) => (
    <View style={localStyles.row}>
      <Text style={localStyles.symbol}>{item.symbol}</Text>
      <Text style={localStyles.description}>{item.description}</Text>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: HorizonSection }) => (
    <View style={localStyles.sectionHeader}>
      <Text style={globalStyles.sectionTitle}>{section.title}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* ── Search bar ── */}
      <View style={localStyles.searchContainer}>
        <TextInput
          style={[globalStyles.input, { marginBottom: 0 }]}
          placeholder="Symbol oder Beschreibung suchen…"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
          autoCorrect={false}
        />
      </View>

      {/* ── Dictionary list ── */}
      <SectionList
        ref={listRef}
        sections={filtered}
        keyExtractor={(item, index) => `${item.symbol}-${index}`}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={{ paddingBottom: 30 }}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        extraData={query}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 20, paddingTop: 40, gap: 8 }}>
            <Text style={globalStyles.emptyText}>Keine Einträge gefunden.</Text>
            <Text style={globalStyles.emptyText}>
              Das bedeutet nicht dass dein gesuchter Horizont nicht existiert.
              Dies ist nur eine kleine Horizontauswahl. Schau mal in der KA6
              nach.
            </Text>
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
