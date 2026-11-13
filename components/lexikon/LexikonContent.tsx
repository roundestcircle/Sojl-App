import { useEffect, useMemo, useRef, useState } from "react";
import { SectionList, StyleSheet, Text, TextInput, View } from "react-native";
import { styles as globalStyles } from "@/styles/styles";
import TermRow, { type TermRowProps } from "@/components/lexikon/TermRow";

type SectionShape<TItem> = { title: string; data: TItem[] };

type Props<TItem, TSection extends SectionShape<TItem>> = {
  sections: TSection[];
  /** Maps a data entry to the row it is displayed as. */
  toRow: (item: TItem) => TermRowProps;
  /**
   * Returns true if `item` matches the lowercased query. Defaults to a search
   * over all text fields of the displayed row (term, caption, text).
   */
  filterItem?: (item: TItem, queryLower: string) => boolean;
  keyExtractor?: (item: TItem, index: number) => string;
  searchPlaceholder?: string;
  /** Extra paragraph shown below "Keine Einträge gefunden." */
  emptyHint?: string;
};

/**
 * Reusable search + SectionList shell for dictionary-style lookups
 * (Horizontlexikon, Humusformlexikon, Funktionsweise). Handles state,
 * filtering, and the scroll-to-top reset that prevents the list from appearing
 * empty after a filter shrinks the dataset. The wrappers only supply config.
 */
export default function LexikonContent<
  TItem,
  TSection extends SectionShape<TItem>,
>({
  sections,
  toRow,
  filterItem,
  keyExtractor,
  searchPlaceholder = "Suchen…",
  emptyHint,
}: Props<TItem, TSection>) {
  const [query, setQuery] = useState("");
  const listRef = useRef<SectionList<TItem, TSection>>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    const matches =
      filterItem ??
      ((item: TItem, queryLower: string) =>
        Object.values(toRow(item)).some(
          (v) => typeof v === "string" && v.toLowerCase().includes(queryLower),
        ));
    return sections
      .map((s) => ({ ...s, data: s.data.filter((e) => matches(e, q)) }))
      .filter((s) => s.data.length > 0);
  }, [query, sections, filterItem, toRow]);

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
        keyExtractor={
          keyExtractor ??
          ((item, index) => `${toRow(item).term ?? "eintrag"}-${index}`)
        }
        renderItem={({ item }) => <TermRow {...toRow(item)} />}
        renderSectionHeader={({ section }) => (
          <View style={localStyles.sectionHeader}>
            <Text style={globalStyles.sectionTitle}>{section.title}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 20, paddingTop: 40, gap: 8 }}>
            <Text style={globalStyles.emptyText}>Keine Einträge gefunden.</Text>
            {emptyHint != null && (
              <Text style={globalStyles.emptyText}>{emptyHint}</Text>
            )}
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
});
