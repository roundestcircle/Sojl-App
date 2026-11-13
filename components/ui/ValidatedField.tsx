import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import type { TextInputProps, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Dialog from "@/components/ui/Dialog";
import { styles } from "@/styles/styles";
import { colors, fontSize, radius, spacing } from "@/styles/theme";
import type {
  SuggestionPayload,
  ValidationResult,
} from "@/lib/validation/fieldValidation";

type Props = Omit<TextInputProps, "onChangeText" | "value" | "onBlur"> & {
  value: string;
  onChangeText: (next: string) => void;
  validate: (raw: string) => ValidationResult;
  /** Cross-field fail signal. When true, the icon shows even if validate() passes. */
  externalInvalid?: boolean;
  /** Cross-field suggestion shown when externalInvalid is true. */
  externalSuggestion?: SuggestionPayload;
  containerStyle?: StyleProp<ViewStyle>;
  /** Optional label shown above the suggestion modal. */
  fieldLabel?: string;
};

/**
 * TextInput (placeholder colour preset) that surfaces a red exclamation badge when the value is non-empty,
 * has been blurred at least once, and the validator reports an issue.
 * Tapping the badge opens a modal with a range hint or a tappable list of
 * suggested values. List taps replace the input value with the suggestion.
 */
export default function ValidatedField({
  value,
  onChangeText,
  validate,
  externalInvalid,
  externalSuggestion,
  containerStyle,
  fieldLabel,
  style,
  placeholderTextColor = colors.placeholder,
  ...rest
}: Props) {
  const [touched, setTouched] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const result = useMemo(() => validate(value), [validate, value]);
  const hasContent = value.trim().length > 0;
  const ownFail = !result.valid && hasContent;
  const showIcon = touched && (ownFail || (externalInvalid ?? false));

  const suggestion: SuggestionPayload | undefined = !result.valid
    ? result.suggestion
    : externalInvalid
      ? externalSuggestion
      : undefined;

  const handleBlur = () => {
    setTouched(true);
    if (result.valid && result.normalized && result.normalized !== value) {
      onChangeText(result.normalized);
    }
  };

  return (
    <View style={[localStyles.wrapper, containerStyle]}>
      <TextInput
        {...rest}
        placeholderTextColor={placeholderTextColor}
        style={[styles.input, localStyles.input, style]}
        value={value}
        onChangeText={onChangeText}
        onBlur={handleBlur}
      />

      {showIcon && (
        <TouchableOpacity
          style={localStyles.badge}
          onPress={() => setModalOpen(true)}
          accessibilityLabel="Eingabe prüfen"
        >
          <Ionicons name="alert-circle" size={26} color={colors.danger} />
        </TouchableOpacity>
      )}

      <Dialog
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        title={fieldLabel ?? "Mögliche Werte"}
        closeIcon
        padded={false}
      >
        {suggestion && (
          <SuggestionBody
            suggestion={suggestion}
            onPick={(v) => {
              onChangeText(v);
              setModalOpen(false);
            }}
          />
        )}
      </Dialog>
    </View>
  );
}

// ─── Body renderer ────────────────────────────────────────────────────────────

function SuggestionBody({
  suggestion,
  onPick,
}: {
  suggestion: SuggestionPayload;
  onPick: (value: string) => void;
}) {
  if (suggestion.kind === "range") {
    return (
      <View style={localStyles.body}>
        <Text style={localStyles.description}>{suggestion.description}</Text>
        {!(suggestion.min === 0 && suggestion.max === 0) && (
          <View style={localStyles.rangeBox}>
            <Text style={localStyles.rangeText}>
              {formatRange(suggestion.min, suggestion.max, suggestion.integer)}
              {suggestion.unit ? ` ${suggestion.unit}` : ""}
            </Text>
          </View>
        )}
      </View>
    );
  }
  return (
    <View style={localStyles.body}>
      <Text style={localStyles.description}>{suggestion.description}</Text>
      <ScrollView style={localStyles.listScroll}>
        {suggestion.items.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={localStyles.listItem}
            onPress={() => onPick(item.value)}
          >
            <Text style={localStyles.listValue}>{item.value}</Text>
            {item.label && (
              <Text style={localStyles.listLabel}>{item.label}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function formatRange(min: number, max: number, integer?: boolean): string {
  const fmt = (n: number) =>
    integer ? String(Math.round(n)) : String(n).replace(".", ",");
  return `${fmt(min)}–${fmt(max)}`;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const localStyles = StyleSheet.create({
  wrapper: {
    position: "relative",
    flex: 1,
  },
  input: {
    paddingRight: 40,
  },
  badge: {
    position: "absolute",
    right: 6,
    top: 0,
    bottom: 0,
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
    flexShrink: 1,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.textBody,
    lineHeight: 21,
  },
  rangeBox: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  rangeText: {
    fontSize: fontSize.lg,
    fontWeight: "700",
    color: colors.primary,
  },
  listScroll: {
    maxHeight: 360,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.dividerLight,
  },
  listValue: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
    minWidth: 72,
  },
  listLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    flex: 1,
  },
});
