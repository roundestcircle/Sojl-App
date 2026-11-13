import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "@/styles/styles";
import { colors, spacing } from "@/styles/theme";

type Props = {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
};

/** Form section whose body is shown or hidden by tapping its title. */
export default function CollapsibleSection({
  title,
  expanded,
  onToggle,
  children,
}: Props) {
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={localStyles.header}
        onPress={onToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.primary}
        />
      </TouchableOpacity>
      {expanded && <View style={localStyles.content}>{children}</View>}
    </View>
  );
}

const localStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  content: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
