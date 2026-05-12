import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { styles } from '@/styles/styles';
import { colors } from '@/styles/colors';

type Props = {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
};

export default function CollapsibleSection({ title, expanded, onToggle, children }: Props) {
  return (
    <View style={styles.section}>
      <TouchableOpacity style={localStyles.header} onPress={onToggle} activeOpacity={0.7}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={localStyles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded && <View style={localStyles.content}>{children}</View>}
    </View>
  );
}

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chevron: {
    fontSize: 12,
    color: colors.primary,
  },
  content: {
    gap: 8,
    marginTop: 4,
  },
});
