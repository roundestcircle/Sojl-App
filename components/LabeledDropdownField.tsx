import { useState } from 'react';
import { Text, TouchableOpacity, Modal, FlatList, SectionList, StyleSheet, View } from 'react-native';
import { styles } from '@/styles/styles';
import { colors } from '@/styles/colors';

export type LabeledOption = { code: string; label: string };
export type LabeledSection = { title: string; data: LabeledOption[] };

type Props = {
  value: string;
  options?: LabeledOption[];
  sections?: LabeledSection[];
  placeholder?: string;
  onChange: (code: string) => void;
};

/**
 * Dropdown that shows "code — label" in the list but stores and displays only the code.
 * Supports flat lists (options) and grouped lists with section headers (sections).
 * Tapping the active item again clears the selection.
 */
export default function LabeledDropdownField({
  value,
  options,
  sections,
  placeholder = 'Auswählen...',
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const handleSelect = (code: string) => {
    onChange(code === value ? '' : code);
    setOpen(false);
  };

  const renderItem = ({ item }: { item: LabeledOption }) => (
    <TouchableOpacity
      style={[localStyles.option, item.code === value && localStyles.optionSelected]}
      onPress={() => handleSelect(item.code)}
    >
      <Text style={[localStyles.optionCode, item.code === value && localStyles.optionActive]}>
        {item.code}
      </Text>
      <Text style={[localStyles.optionLabel, item.code === value && localStyles.optionActive]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={localStyles.sectionHeader}>
      <Text style={localStyles.sectionHeaderText}>{section.title}</Text>
    </View>
  );

  return (
    <>
      <TouchableOpacity style={[styles.input, localStyles.trigger]} onPress={() => setOpen(true)}>
        <Text style={value ? localStyles.value : localStyles.placeholder}>{value || placeholder}</Text>
        <Text style={localStyles.arrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={localStyles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          {/* onStartShouldSetResponder stops taps inside the sheet from closing the modal */}
          <View style={localStyles.sheet} onStartShouldSetResponder={() => true}>
            {sections ? (
              <SectionList
                sections={sections}
                keyExtractor={(item) => item.code}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                stickySectionHeadersEnabled={false}
              />
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item) => item.code}
                renderItem={renderItem}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const localStyles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: { color: '#222', fontSize: 16 },
  placeholder: { color: colors.primary + '66', fontSize: 16 },
  arrow: { color: colors.primary, fontSize: 18 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 32,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  optionSelected: { backgroundColor: colors.primary + '18' },
  optionCode: { fontSize: 14, fontWeight: '700', color: '#222', width: 44 },
  optionLabel: { fontSize: 14, color: '#555', flex: 1 },
  optionActive: { color: colors.primary },
  sectionHeader: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
