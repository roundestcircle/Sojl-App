import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import type { TextInputProps, StyleProp, ViewStyle } from "react-native";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import type {
  SuggestionPayload,
  ValidationResult,
} from "@/utils/fieldValidation";

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
 * TextInput that surfaces a red exclamation badge when the value is non-empty,
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
  onFocus,
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
        style={[styles.input, localStyles.input, style]}
        value={value}
        onChangeText={onChangeText}
        onBlur={handleBlur}
        onFocus={(e) => {
          // Reset touched when the user comes back to fix the field so the
          // icon doesn't disappear mid-edit; we re-check on next blur.
          onFocus?.(e);
        }}
      />

      {showIcon && (
        <TouchableOpacity
          style={localStyles.badge}
          onPress={() => setModalOpen(true)}
          accessibilityLabel="Eingabe prüfen"
        >
          <Text style={localStyles.badgeText}>!</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOpen(false)}
      >
        <TouchableOpacity
          style={localStyles.overlay}
          activeOpacity={1}
          onPress={() => setModalOpen(false)}
        >
          <View
            style={localStyles.sheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={localStyles.sheetHeader}>
              <Text style={localStyles.sheetTitle}>
                {fieldLabel ?? "Mögliche Werte"}
              </Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Text style={localStyles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {suggestion && (
              <SuggestionBody
                suggestion={suggestion}
                onPick={(v) => {
                  onChangeText(v);
                  setModalOpen(false);
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
  badgeText: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#c00",
    color: "#fff",
    textAlign: "center",
    lineHeight: 24,
    fontSize: 16,
    fontWeight: "800",
    overflow: "hidden",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    maxHeight: "80%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    flex: 1,
  },
  closeBtn: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 6,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  rangeBox: {
    backgroundColor: colors.primary + "18",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  rangeText: {
    fontSize: 20,
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
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  listValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    minWidth: 72,
  },
  listLabel: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
});
