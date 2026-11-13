import type { ReactNode } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  type StyleProp,
  type TextStyle,
} from "react-native";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import InfoButton from "@/components/ui/InfoButton";

/** Placeholder text color used by every form input. */
export const PLACEHOLDER_COLOR = colors.primary + "66";

const CALC_PLACEHOLDER = "Wird berechnet…";

// ─── Fullscreen tool modal ─────────────────────────────────────────────────────

// Moved to components/ui; re-exported until all form imports are switched over.

// ─── Layout helpers ────────────────────────────────────────────────────────────

/** Wraps a group of related form fields with a section title and bottom divider. */
export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

/** Section title with an optional (?) info button next to it. */
export function HeadingRow({
  title,
  info,
  titleStyle = styles.sectionTitle,
}: {
  title: string;
  info?: string;
  titleStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={formStyles.headingRow}>
      <Text style={titleStyle}>{title}</Text>
      {info && <InfoButton text={info} />}
    </View>
  );
}

// ─── Read-only (calculated) fields ─────────────────────────────────────────────

/** Read-only input for an automatically calculated value, with optional unit. */
export function ReadonlyField({
  value,
  unit,
  placeholder = CALC_PLACEHOLDER,
}: {
  value: string;
  unit?: string;
  placeholder?: string;
}) {
  if (!unit) {
    return (
      <TextInput
        style={[styles.input, styles.readonlyInput]}
        placeholder={placeholder}
        placeholderTextColor={PLACEHOLDER_COLOR}
        value={value}
        editable={false}
      />
    );
  }
  return (
    <View style={formStyles.inputWithUnit}>
      <TextInput
        style={[styles.input, styles.readonlyInput, { flex: 1 }]}
        placeholder={placeholder}
        placeholderTextColor={PLACEHOLDER_COLOR}
        value={value}
        editable={false}
      />
      <Text style={formStyles.unit}>{unit}</Text>
    </View>
  );
}

/** {@link ReadonlyField} bound to a react-hook-form field. */
export function ControlledReadonlyField<T extends FieldValues>({
  control,
  name,
  unit,
  placeholder,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  unit?: string;
  placeholder?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value } }) => (
        <ReadonlyField
          value={value as string}
          unit={unit}
          placeholder={placeholder}
        />
      )}
    />
  );
}

/** "Bewertung" label followed by a read-only rating text. */
export function RatingField({ value }: { value: string }) {
  return (
    <>
      <Text style={styles.fieldLabel}>Bewertung</Text>
      <ReadonlyField value={value} />
    </>
  );
}

// ─── Plain text field lists ────────────────────────────────────────────────────

/** `[fieldName, label, placeholder?]` tuple for {@link TextFieldList}. */
export type TextFieldSpec<T extends FieldValues> = readonly [
  FieldPath<T>,
  string,
  string?,
];

/** Renders a labeled free-text input for every entry in `fields`. */
export function TextFieldList<T extends FieldValues>({
  control,
  fields,
}: {
  control: Control<T>;
  fields: readonly TextFieldSpec<T>[];
}) {
  return (
    <>
      {fields.map(([name, label, placeholder]) => (
        <View key={name}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={PLACEHOLDER_COLOR}
                onChangeText={onChange}
                value={value as string}
              />
            )}
          />
        </View>
      ))}
    </>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

export const formStyles = StyleSheet.create({
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inputWithUnit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fieldWithTool: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  halfRowBtn: {
    width: 150,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  unit: {
    color: colors.primary,
    fontSize: 13,
  },
  calcBlock: {
    gap: 6,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
});
