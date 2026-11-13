import { StyleSheet } from "react-native";
import { colors, fontSize, radius, spacing } from "./theme";

/**
 * Text and layout styles shared across screens. Buttons, rows and dialogs are
 * components in components/ui (Button, NavRow, Dialog) and carry their own styles.
 */
export const styles = StyleSheet.create({
  // ─── Screen layout ─────────────────────────────────────────────────────────

  /** Centred column for short screens (home, permission prompts, 404). */
  centered: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    paddingVertical: spacing.md,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
  },

  /** Scroll content of tool screens. */
  toolContent: {
    padding: spacing.screen,
    paddingBottom: 40,
    gap: spacing.lg,
  },

  /** FlatList content of the campaign/Aufnahme lists. */
  list: {
    gap: 10,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.screen,
    flexGrow: 1,
  },

  /** Buttons pinned below a scrolling list. */
  bottomBar: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },

  // ─── Text ──────────────────────────────────────────────────────────────────

  text: {
    fontSize: fontSize.base,
    color: colors.textBody,
  },

  /** Bold green heading text, e.g. a decision-tree question. */
  title: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: "bold",
  },

  link: {
    color: colors.link,
    textDecorationLine: "underline",
  },

  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },

  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 40,
    fontSize: fontSize.base,
  },

  // ─── Forms ─────────────────────────────────────────────────────────────────

  section: {
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: colors.primary,
    marginBottom: spacing.xs,
  },

  fieldLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },

  /** Label plus input(s) of one tool field. */
  fieldGroup: {
    gap: spacing.xs,
  },

  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text,
    backgroundColor: colors.inputBackground,
  },

  readonlyInput: {
    backgroundColor: colors.surfaceMuted,
    color: colors.textSecondary,
  },

  formRow: {
    flexDirection: "row",
    gap: spacing.md,
  },

  halfField: {
    flex: 1,
    gap: spacing.xs,
  },

  // ─── Tool results ──────────────────────────────────────────────────────────

  resultBox: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  resultValue: {
    fontSize: fontSize.xxl,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "center",
  },

  resultLabel: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
  },

  resultPlaceholder: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});
