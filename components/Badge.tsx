import { Text, View } from "react-native";
import { styles } from "@/styles/styles";

type Props = {
  label: string;
  color: string;
};

/**
 * Shared colored-pill badge used for status indicators on rows (Standortdaten,
 * Horizonte, Aufnahmen, Kampagnen). Background color comes from the caller so
 * each status surface keeps its own palette.
 */
export default function Badge({ label, color }: Props) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}
