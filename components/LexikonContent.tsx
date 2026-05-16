import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SectionList, StyleSheet, Text, TextInput, View } from "react-native";
import { styles as globalStyles } from "@/styles/styles";

type SectionShape<TItem> = { title: string; data: TItem[] };

type Props<TItem, TSection extends SectionShape<TItem>> = {
  sections: TSection[];
  /** Returns true if `item` matches the lowercased query. */
  filterItem: (item: TItem, queryLower: string) => boolean;
  renderItem: (item: TItem) => ReactNode;
  keyExtractor: (item: TItem, index: number) => string;
  searchPlaceholder?: string;
  /** Rendered inside the list when no entry matches the query. */
  emptyContent?: ReactNode;
};

/**
 * Reusable search + SectionList shell for dictionary-style lookups
 * (HorizontLexikon, HumusformLexikon, …). Handles state, filtering, and the
 * scroll-to-top reset that prevents the list from appearing empty after a
 * filter shrinks the dataset.
 */
export default function LexikonContent<
  TItem,
  TSection extends SectionShape<TItem>,
>({
  sections,
  filterItem,
  renderItem,
  keyExtractor,
  searchPlaceholder = "Suchen…",
  emptyContent,
}: Props<TItem, TSection>) {
  const [query, setQuery] = useState("");
  const listRef = useRef<SectionList<TItem, TSection>>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({ ...s, data: s.data.filter((e) => filterItem(e, q)) }))
      .filter((s) => s.data.length > 0);
  }, [query, sections, filterItem]);

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

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={localStyles.searchContainer}>
        <TextInput
          style={[globalStyles.input, { marginBottom: 0 }]}
          placeholder={searchPlaceholder}
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
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <>{renderItem(item)}</>}
        renderSectionHeader={({ section }) => (
          <View style={localStyles.sectionHeader}>
            <Text style={globalStyles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        extraData={query}
        ListEmptyComponent={
          emptyContent != null ? (
            <View style={{ paddingHorizontal: 20, paddingTop: 40, gap: 8 }}>
              {emptyContent}
            </View>
          ) : (
            <View style={{ paddingHorizontal: 20, paddingTop: 40 }}>
              <Text style={globalStyles.emptyText}>
                Keine Einträge gefunden.
              </Text>
            </View>
          )
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
});
