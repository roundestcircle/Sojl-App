import { View, Text, TextInput } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { styles } from "@/styles/styles";
import LabeledDropdownField, {
  type LabeledOption,
  type LabeledSection,
} from "@/components/ui/LabeledDropdownField";
import {
  EXPOS,
  RELIEFPOS_OPTIONS,
  WITTERUNG_OPTIONS,
  NUTZUNG_SECTIONS,
  VEGETATION_SECTIONS,
} from "@/data/aufnahmeOptions";
import { formStyles, PLACEHOLDER_COLOR } from "../shared";
import type { AufnahmeFormData } from "./types";

type DropdownName =
  | "reliefpos"
  | "expos"
  | "nutzung"
  | "vegetation"
  | "witterung";

/** "Standorteigenschaften" and "Klimadaten" blocks (dropdowns + climate means). */
export default function StandorteigenschaftenSection() {
  return (
    <>
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
        Standorteigenschaften
      </Text>
      <View style={styles.formRow}>
        <Dropdown
          name="reliefpos"
          label="Reliefposition (15)"
          options={RELIEFPOS_OPTIONS}
        />
        <Dropdown name="expos" label="Exposition (13)" options={EXPOS} />
      </View>
      <View style={styles.formRow}>
        <Dropdown
          name="nutzung"
          label="Nutzung (18)"
          sections={NUTZUNG_SECTIONS}
        />
        <Dropdown
          name="vegetation"
          label="Vegetation (19)"
          sections={VEGETATION_SECTIONS}
        />
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Klimadaten</Text>
      <View style={styles.formRow}>
        <Dropdown
          name="witterung"
          label="Witterung (20)"
          options={WITTERUNG_OPTIONS}
        />
        <NumberWithUnit
          name="mittl_n"
          label="Mittl. Niederschlag"
          placeholder="z.B. 700"
          unit="mm"
          keyboardType="number-pad"
        />
      </View>
      <View style={styles.formRow}>
        <NumberWithUnit
          name="mittl_temp"
          label="Mittl. Temperatur"
          placeholder="z.B. 9.5"
          unit="°C"
          keyboardType="decimal-pad"
        />
      </View>
    </>
  );
}

/** Half-width labeled dropdown bound to a form field. */
function Dropdown({
  name,
  label,
  options,
  sections,
}: {
  name: DropdownName;
  label: string;
  options?: LabeledOption[] | readonly string[];
  sections?: LabeledSection[];
}) {
  const { control } = useFormContext<AufnahmeFormData>();
  return (
    <View style={styles.halfField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <LabeledDropdownField
            value={value}
            options={options}
            sections={sections}
            placeholder="Auswählen…"
            onChange={onChange}
          />
        )}
      />
    </View>
  );
}

/** Half-width numeric input with a unit label. */
function NumberWithUnit({
  name,
  label,
  placeholder,
  unit,
  keyboardType,
}: {
  name: "mittl_n" | "mittl_temp";
  label: string;
  placeholder: string;
  unit: string;
  keyboardType: "number-pad" | "decimal-pad";
}) {
  const { control } = useFormContext<AufnahmeFormData>();
  return (
    <View style={styles.halfField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View style={formStyles.inputWithUnit}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              keyboardType={keyboardType}
              placeholder={placeholder}
              placeholderTextColor={PLACEHOLDER_COLOR}
              onChangeText={onChange}
              value={value}
            />
            <Text style={formStyles.unit}>{unit}</Text>
          </View>
        )}
      />
    </View>
  );
}
