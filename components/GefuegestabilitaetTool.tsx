import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { styles } from '@/styles/styles';
import { colors } from '@/styles/colors';

type Props = {
  onConfirm?: (value: string) => void;
};

export default function GefuegestabilitaetTool({ onConfirm }: Props) {
  return (
    <View style={localStyles.container}>
      <Text style={localStyles.placeholder}>Gefügestabilität-Bestimmung</Text>
      <Text style={localStyles.sub}>Inhalt folgt</Text>
      {onConfirm && (
        <TouchableOpacity style={[styles.actionButton, localStyles.btn]} onPress={() => onConfirm('test')}>
          <Text style={styles.actionButtonText}>Wert übernehmen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  placeholder: { fontSize: 22, fontWeight: '700', color: colors.primary },
  sub: { fontSize: 16, color: '#888' },
  btn: { marginTop: 16, alignSelf: 'stretch' },
});
