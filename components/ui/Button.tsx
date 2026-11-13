import type { ComponentProps } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSize, radius, spacing } from "@/styles/theme";

export type ButtonVariant =
  "filled" | "outline" | "danger" | "warning" | "neutral";

/**
 * - `lg`: big touch target with bold label (outline default), main actions.
 * - `md`: compact (filled default), secondary actions and tool buttons.
 * - `sm`: small inline control, e.g. "Zu UTM wechseln".
 */
export type ButtonSize = "sm" | "md" | "lg";

type Props = {
  /** Omit for an icon-only button (then pass `accessibilityLabel`). */
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Smaller text below the title, e.g. on decision-tree answers. */
  description?: string;
  /** Text alignment; `left` for long answer texts. */
  align?: "center" | "left";
  icon?: ComponentProps<typeof Ionicons>["name"];
  /** Shows a spinner instead of the label and blocks presses. */
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

const FILL: Record<Exclude<ButtonVariant, "outline">, string> = {
  filled: colors.primary,
  danger: colors.danger,
  warning: colors.warning,
  neutral: colors.neutral,
};

/** The app's one button: filled (green/red/amber/grey) or outlined. */
export default function Button({
  title,
  onPress,
  variant = "filled",
  size = variant === "outline" ? "lg" : "md",
  description,
  align = "center",
  icon,
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
}: Props) {
  const outline = variant === "outline";
  const fg = outline ? colors.primary : colors.white;
  const inactive = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        localStyles.base,
        localStyles[size],
        variant === "outline"
          ? [localStyles.outline, size === "sm" && localStyles.outlineSm]
          : { backgroundColor: FILL[variant], borderColor: FILL[variant] },
        align === "left" && localStyles.left,
        disabled && localStyles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <View style={localStyles.titleRow}>
          {icon && (
            <Ionicons name={icon} size={TEXT[size].fontSize + 2} color={fg} />
          )}
          {title != null && (
            <Text
              style={[
                TEXT[size],
                localStyles.title,
                { color: fg, textAlign: align === "left" ? "left" : "center" },
              ]}
            >
              {title}
            </Text>
          )}
        </View>
      )}
      {description != null && !loading && (
        <Text style={localStyles.description}>{description}</Text>
      )}
    </TouchableOpacity>
  );
}

const TEXT = StyleSheet.create({
  sm: { fontSize: fontSize.sm, fontWeight: "600" },
  md: { fontSize: fontSize.md, fontWeight: "600" },
  lg: { fontSize: fontSize.lg, fontWeight: "bold" },
});

const localStyles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
  },
  left: {
    alignItems: "flex-start",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  title: {
    flexShrink: 1,
  },
  sm: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
  },
  md: {
    paddingVertical: spacing.md,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
  },
  // Border on every lg button so filled and outline ones have the same height.
  lg: {
    padding: 18,
    borderWidth: 3,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  outlineSm: {
    borderWidth: 1.5,
  },
  disabled: {
    opacity: 0.4,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
