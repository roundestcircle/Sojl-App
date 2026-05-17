import { useMemo, useState } from "react";
import {
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SectionList,
  StyleSheet,
  View,
  TextInput,
} from "react-native";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";

export type LabeledOption = { code: string; label?: string };
export type LabeledSection = { title: string; data: LabeledOption[] };

type Props = {
  value: string;
  /** Either a flat option list or string array (treated as code-only options). */
  options?: LabeledOption[] | readonly string[];
  sections?: LabeledSection[];
  placeholder?: string;
  onChange: (code: string) => void;
};

function normalize(
  options: LabeledOption[] | readonly string[] | undefined,
): LabeledOption[] | undefined {
  if (!options) return undefined;
  if (options.length === 0) return [];
  return typeof options[0] === "string"
    ? (options as readonly string[]).map((code) => ({ code }))
    : (options as LabeledOption[]);
}

/**
 * Dropdown that shows "code — label" in the list but stores and displays only the code.
 * Supports flat lists (options) and grouped lists with section headers (sections).
 * Tapping the active item again clears the selection.
 */
export default function LabeledDropdownField({
  value,
  options,
  sections,
  placeholder = "Auswählen...",
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const flatOptions = normalize(options);
  const [query, setQuery] = useState("");

  const filteredFlat = useMemo(() => {
    if (!flatOptions) return undefined;
    const q = query.trim().toLowerCase();
    if (!q) return flatOptions;
    return flatOptions.filter((o) => {
      const label = (o.label ?? "") + " " + o.code;
      return (
        label.toLowerCase().includes(q) || o.code.toLowerCase().includes(q)
      );
    });
  }, [flatOptions, query]);

  const filteredSections = useMemo(() => {
    if (!sections) return undefined;
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        data: s.data.filter((o) => {
          const label = (o.label ?? "") + " " + o.code;
          return (
            label.toLowerCase().includes(q) || o.code.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((s) => s.data.length > 0);
  }, [sections, query]);

  const closeSheet = () => {
    setOpen(false);
    setQuery("");
  };

  const handleSelect = (code: string) => {
    onChange(code === value ? "" : code);
    closeSheet();
  };

  const renderItem = ({ item }: { item: LabeledOption }) => (
    <TouchableOpacity
      style={[
        localStyles.option,
        item.code === value && localStyles.optionSelected,
      ]}
      onPress={() => handleSelect(item.code)}
    >
      <Text
        style={[
          localStyles.optionCode,
          item.code === value && localStyles.optionActive,
        ]}
      >
        {item.code}
      </Text>
      {item.label != null && (
        <Text
          style={[
            localStyles.optionLabel,
            item.code === value && localStyles.optionActive,
          ]}
        >
          {item.label}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={localStyles.sectionHeader}>
      <Text style={localStyles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.input, localStyles.trigger]}
        onPress={() => setOpen(true)}
      >
        <Text style={value ? localStyles.value : localStyles.placeholder}>
          {value || placeholder}
        </Text>
        <Text style={localStyles.arrow}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={closeSheet}
      >
        <TouchableOpacity
          style={localStyles.overlay}
          activeOpacity={1}
          onPress={closeSheet}
        >
          {/* onStartShouldSetResponder stops taps inside the sheet from closing the modal */}
          <View
            style={localStyles.sheet}
            onStartShouldSetResponder={() => true}
          >
            <View>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Suchen..."
                style={localStyles.search}
                clearButtonMode="while-editing"
              />

              {filteredSections ? (
                <SectionList
                  sections={filteredSections}
                  keyExtractor={(item) => item.code}
                  renderItem={renderItem}
                  renderSectionHeader={renderSectionHeader}
                  stickySectionHeadersEnabled={false}
                  ListEmptyComponent={
                    <Text style={localStyles.empty}>Keine Ergebnisse</Text>
                  }
                  keyboardShouldPersistTaps="handled"
                />
              ) : (
                <FlatList
                  data={filteredFlat}
                  keyExtractor={(item) => item.code}
                  renderItem={renderItem}
                  ListEmptyComponent={
                    <Text style={localStyles.empty}>Keine Ergebnisse</Text>
                  }
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const localStyles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: { color: "#222", fontSize: 16 },
  placeholder: { color: colors.primary + "66", fontSize: 16 },
  arrow: { color: colors.primary, fontSize: 18 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    padding: 32,
  },
  sheet: {
    position: "absolute",
    left: 32,
    right: 32,
    top: "20%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    maxHeight: "80%",
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  optionSelected: { backgroundColor: colors.primary + "18" },
  optionCode: { fontSize: 14, fontWeight: "700", color: "#222", width: 44 },
  optionLabel: { fontSize: 14, color: "#555", flex: 1 },
  optionActive: { color: colors.primary },
  sectionHeader: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  search: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
    fontSize: 16,
  },
  empty: {
    padding: 16,
    textAlign: "center" as const,
    color: "#888",
  },
});
