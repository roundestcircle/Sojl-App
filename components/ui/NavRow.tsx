import type { ReactNode } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Link, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSize, radius, spacing } from "@/styles/theme";

/** Narrow button at the right edge of a row, e.g. "ZIP" export. */
export type RowAction = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
};

type Props = {
  /** A string is rendered as the bold row title; pass a node for custom content. */
  title: ReactNode;
  subtitle?: string;
  /** Rendered right after the title, e.g. a direction arrow. */
  titleAccessory?: ReactNode;
  /** Rendered left of the title, e.g. reorder controls. */
  leading?: ReactNode;
  /** Rendered before the chevron, usually a StatusBadge. */
  badge?: ReactNode;
  /** Navigates on press; alternatively pass `onPress`. */
  href?: Href;
  onPress?: () => void;
  onLongPress?: () => void;
  /** Shows a spinner instead of the chevron and blocks presses. */
  loading?: boolean;
  /** Green background, e.g. for an Aufnahme the user is standing at. */
  highlighted?: boolean;
  action?: RowAction;
};

/**
 * Bordered list/navigation row: optional leading control, title (+ subtitle),
 * badge and chevron, plus an optional side action separated by a divider.
 */
export default function NavRow({
  title,
  subtitle,
  titleAccessory,
  leading,
  badge,
  href,
  onPress,
  onLongPress,
  loading = false,
  highlighted = false,
  action,
}: Props) {
  const main = (
    <TouchableOpacity
      style={localStyles.main}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={loading}
      activeOpacity={0.75}
      accessibilityRole="button"
    >
      {leading}
      <View style={localStyles.body}>
        <View style={localStyles.titleRow}>
          {typeof title === "string" ? (
            <Text style={localStyles.title}>{title}</Text>
          ) : (
            title
          )}
          {titleAccessory}
        </View>
        {subtitle != null && (
          <Text style={localStyles.subtitle}>{subtitle}</Text>
        )}
      </View>
      {badge}
      {loading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : (
        <Ionicons name="chevron-forward" size={22} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[localStyles.row, highlighted && localStyles.highlighted]}>
      {href != null ? (
        <Link href={href} asChild>
          {main}
        </Link>
      ) : (
        main
      )}
      {action && (
        <TouchableOpacity
          style={localStyles.action}
          onPress={action.onPress}
          disabled={action.loading || action.disabled}
          accessibilityRole="button"
          accessibilityLabel={action.accessibilityLabel ?? action.label}
        >
          {action.loading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={localStyles.actionText}>{action.label}</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    overflow: "hidden",
  },
  highlighted: {
    backgroundColor: colors.successTint,
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    flexShrink: 1,
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  action: {
    width: 52,
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 2,
    borderLeftColor: colors.primaryBorder,
  },
  actionText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: fontSize.sm,
  },
});

/** Title text style, for callers that render a custom `title` node. */
export const rowTitleStyle = localStyles.title;
