import { useState } from 'react';
import { Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { View } from 'react-native';
import { styles } from '@/styles/styles';
import { colors } from '@/styles/colors';

type Props = {
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function DropdownField({ value, options, placeholder = 'Auswählen...', onChange }: Props) {
  const [open, setOpen] = useState(false);

  const handleSelect = (item: string) => {
    onChange(item === value ? '' : item);
    setOpen(false);
  };

  return (
    <>
      <TouchableOpacity style={[styles.input, localStyles.trigger]} onPress={() => setOpen(true)}>
        <Text style={value ? localStyles.value : localStyles.placeholder}>{value || placeholder}</Text>
        <Text style={localStyles.arrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={localStyles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={localStyles.sheet}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[localStyles.option, item === value && localStyles.optionSelected]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[localStyles.optionText, item === value && localStyles.optionTextSelected]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
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
    maxHeight: 320,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  optionSelected: { backgroundColor: colors.primary + '18' },
  optionText: { fontSize: 16, color: '#222' },
  optionTextSelected: { color: colors.primary, fontWeight: '700' },
});
