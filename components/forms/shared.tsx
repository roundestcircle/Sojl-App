import type { ReactNode } from "react";
import {
  View,
  Text,
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
import { colors, fontSize, spacing } from "@/styles/theme";
import InfoButton from "@/components/ui/InfoButton";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";

const CALC_PLACEHOLDER = "Wird berechnet…";

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

/** Row with an input on the left and a fixed-width tool button on the right. */
export function WithToolButton({
  label = "Bestimmungshilfe",
  onPress,
  children,
}: {
  label?: string;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <View style={formStyles.row}>
      <View style={formStyles.grow}>{children}</View>
      <Button title={label} onPress={onPress} style={formStyles.toolBtn} />
    </View>
  );
}

/** Input followed by a unit label ("%", "cm" …). */
export function WithUnit({
  unit,
  children,
}: {
  unit: string;
  children: ReactNode;
}) {
  return (
    <View style={formStyles.row}>
      <View style={formStyles.grow}>{children}</View>
      <Text style={formStyles.unit}>{unit}</Text>
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
  const field = (
    <TextField
      style={styles.readonlyInput}
      placeholder={placeholder}
      value={value}
      editable={false}
    />
  );
  return unit ? <WithUnit unit={unit}>{field}</WithUnit> : field;
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
              <TextField
                placeholder={placeholder}
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  grow: {
    flex: 1,
  },
  toolBtn: {
    width: 150,
  },
  unit: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: "600",
  },
  calcBlock: {
    gap: 6,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
  },
});
