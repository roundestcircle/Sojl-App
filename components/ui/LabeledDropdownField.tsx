import { useMemo, useState } from "react";
import {
  Text,
  TouchableOpacity,
  FlatList,
  SectionList,
  StyleSheet,
  View,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Dialog from "@/components/ui/Dialog";
import { styles } from "@/styles/styles";
import { colors, fontSize, spacing } from "@/styles/theme";

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

/** True when the option's code or label contains the (lowercased) query. */
function matches(o: LabeledOption, q: string): boolean {
  return `${o.code} ${o.label ?? ""}`.toLowerCase().includes(q);
}

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
  const flatOptions = useMemo(() => normalize(options), [options]);
  const [query, setQuery] = useState("");

  const filteredFlat = useMemo(() => {
    if (!flatOptions) return undefined;
    const q = query.trim().toLowerCase();
    if (!q) return flatOptions;
    return flatOptions.filter((o) => matches(o, q));
  }, [flatOptions, query]);

  const filteredSections = useMemo(() => {
    if (!sections) return undefined;
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        data: s.data.filter((o) => matches(o, q)),
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
        <Ionicons name="chevron-down" size={18} color={colors.primary} />
      </TouchableOpacity>

      <Dialog visible={open} onClose={closeSheet} padded={false} position="top">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Suchen..."
          placeholderTextColor={colors.textMuted}
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
      </Dialog>
    </>
  );
}

const localStyles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  value: { color: colors.text, fontSize: fontSize.base },
  placeholder: { color: colors.placeholder, fontSize: fontSize.base },
  option: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.dividerLight,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  optionSelected: { backgroundColor: colors.primaryTint },
  optionCode: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
    width: 48,
  },
  optionLabel: { fontSize: fontSize.md, color: colors.textSecondary, flex: 1 },
  optionActive: { color: colors.primary },
  sectionHeader: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  sectionHeaderText: {
    fontSize: fontSize.xs,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  search: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.dividerLight,
    fontSize: fontSize.base,
    color: colors.text,
  },
  empty: {
    padding: spacing.lg,
    textAlign: "center",
    color: colors.textMuted,
  },
});
