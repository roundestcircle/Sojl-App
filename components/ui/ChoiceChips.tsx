import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, fontSize, radius, spacing } from "@/styles/theme";

export type Choice<T extends string> = {
  value: T;
  label: string;
  /** Small second line, e.g. a verbal description. */
  sub?: string;
};

/**
 * Row of equal-width toggle buttons; the selected one is filled. With
 * `deselectable`, tapping the selected chip again clears the selection.
 */
export default function ChoiceChips<T extends string>({
  choices,
  value,
  onChange,
  deselectable = false,
}: {
  choices: readonly Choice<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  deselectable?: boolean;
}) {
  return (
    <View style={localStyles.row}>
      {choices.map((c) => {
        const active = c.value === value;
        return (
          <TouchableOpacity
            key={c.value}
            style={[localStyles.chip, active && localStyles.chipActive]}
            onPress={() => onChange(active && deselectable ? null : c.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
          >
            <Text style={[localStyles.label, active && localStyles.textActive]}>
              {c.label}
            </Text>
            {c.sub != null && (
              <Text style={[localStyles.sub, active && localStyles.textActive]}>
                {c.sub}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const localStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: "center",
    gap: 2,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.primary,
  },
  sub: {
    fontSize: fontSize.xs,
    color: colors.primaryMuted,
  },
  textActive: {
    color: colors.white,
  },
});
