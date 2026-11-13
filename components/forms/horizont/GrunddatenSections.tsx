import type { ReactNode } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Controller, useFormContext, useWatch } from "react-hook-form";
import { styles } from "@/styles/styles";
import ValidatedField from "@/components/ui/ValidatedField";
import LabeledDropdownField, {
  type LabeledOption,
} from "@/components/ui/LabeledDropdownField";
import {
  CARBONAT_OPTIONS,
  FEINWURZELN_OPTIONS,
  PACKUNGSDICHTE_OPTIONS,
} from "@/data/horizontOptions";
import {
  validateTiefe,
  validateBodenart,
  validateTonanteil,
  validateAnteil,
  validatePh,
  validateMunsell,
  tiefeOrderInvalid,
  TIEFE_ORDER_SUGGESTION,
} from "@/lib/validation/fieldValidation";
import {
  bodenartToClay,
  bodenartToClayMidpoint,
} from "@/lib/calc/bodenartClay";
import { Section, formStyles, PLACEHOLDER_COLOR } from "../shared";
import type { HorizontFormData, HorizontTool } from "./types";

type Props = {
  /** Opens the fullscreen Bestimmungshilfe / Lexikon for a field. */
  onOpenTool: (tool: HorizontTool) => void;
};

/**
 * User-entered core fields of a Horizont: Horizontname, Tiefe, Bodenart,
 * Bodeneigenschaften and Notizen. Fields with a determination tool show a
 * button that opens it via `onOpenTool`.
 */
export default function GrunddatenSections({ onOpenTool }: Props) {
  const { control, setValue } = useFormContext<HorizontFormData>();
  const [tiefeOben, tiefeUnten, bodenart] = useWatch({
    control,
    name: ["tiefe_oben", "tiefe_unten", "bodenart"],
  });
  // KA6 clay range of the current Bodenart, shown under Tonanteil
  const tonanteilRange = bodenartToClay(bodenart ?? "");
  const tiefeInvalid = tiefeOrderInvalid(tiefeOben, tiefeUnten);

  const estimateTonanteil = () => {
    const mid = bodenartToClayMidpoint(bodenart ?? "");
    if (mid === null) {
      Alert.alert(
        "Bodenart nicht erkannt",
        "Bitte zuerst eine gültige KA5-Bodenart eingeben.",
      );
      return;
    }
    setValue("tonanteil", String(mid));
  };

  return (
    <>
      <Section title="Horizontname (58)">
        <WithToolButton label="Lexikon" onPress={() => onOpenTool("lexikon")}>
          <Controller
            control={control}
            name="horizontname"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="z.B. Ap, Bv, C"
                placeholderTextColor={PLACEHOLDER_COLOR}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </WithToolButton>
      </Section>

      <Section title="Tiefe (cm) (26)">
        <View style={styles.formRow}>
          {(
            [
              ["tiefe_oben", "Von", "z.B. 0", "Tiefe oben (cm)"],
              ["tiefe_unten", "Bis", "z.B. 30", "Tiefe unten (cm)"],
            ] as const
          ).map(([name, label, placeholder, fieldLabel]) => (
            <View key={name} style={styles.halfField}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value } }) => (
                  <ValidatedField
                    keyboardType="number-pad"
                    placeholder={placeholder}
                    placeholderTextColor={PLACEHOLDER_COLOR}
                    onChangeText={onChange}
                    value={value}
                    validate={validateTiefe}
                    externalInvalid={tiefeInvalid}
                    externalSuggestion={TIEFE_ORDER_SUGGESTION}
                    fieldLabel={fieldLabel}
                  />
                )}
              />
            </View>
          ))}
        </View>
      </Section>

      <Section title="Bodenart / Textur (44)">
        <WithToolButton onPress={() => onOpenTool("bodenart")}>
          <Controller
            control={control}
            name="bodenart"
            render={({ field: { onChange, value } }) => (
              <ValidatedField
                placeholder="z.B. Su2"
                placeholderTextColor={PLACEHOLDER_COLOR}
                onChangeText={onChange}
                value={value}
                validate={validateBodenart}
                fieldLabel="Bodenart / Textur"
              />
            )}
          />
        </WithToolButton>
      </Section>

      <Section title="Bodeneigenschaften">
        <Text style={styles.fieldLabel}>Tonanteil</Text>
        <WithToolButton label="Abschätzen" onPress={estimateTonanteil}>
          <View style={localStyles.inputWithUnit}>
            <Controller
              control={control}
              name="tonanteil"
              render={({ field: { onChange, value } }) => (
                <ValidatedField
                  placeholder="z.B. 17"
                  keyboardType="decimal-pad"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  onChangeText={onChange}
                  value={value}
                  validate={validateTonanteil}
                  fieldLabel="Tonanteil"
                />
              )}
            />
            <Text style={formStyles.unit}>%</Text>
          </View>
        </WithToolButton>
        {tonanteilRange && (
          <Text style={localStyles.hint}>
            KA6-Bereich: {tonanteilRange.min}–{tonanteilRange.max} %
          </Text>
        )}

        <Text style={styles.fieldLabel}>Skelettanteil (45)</Text>
        <WithToolButton onPress={() => onOpenTool("anteil")}>
          <View style={localStyles.inputWithUnit}>
            <Controller
              control={control}
              name="anteil"
              render={({ field: { onChange, value } }) => (
                <ValidatedField
                  placeholder="z.B. 35"
                  keyboardType="number-pad"
                  placeholderTextColor={PLACEHOLDER_COLOR}
                  onChangeText={onChange}
                  value={value}
                  validate={validateAnteil}
                  fieldLabel="Skelettanteil"
                />
              )}
            />
            <Text style={formStyles.unit}>%</Text>
          </View>
        </WithToolButton>

        <Text style={styles.fieldLabel}>pH (CaCl₂)</Text>
        <Controller
          control={control}
          name="ph_cacl2"
          render={({ field: { onChange, value } }) => (
            <ValidatedField
              keyboardType="decimal-pad"
              placeholder="z.B. 5.5"
              placeholderTextColor={PLACEHOLDER_COLOR}
              onChangeText={onChange}
              value={value}
              validate={validatePh}
              fieldLabel="pH (CaCl₂)"
            />
          )}
        />

        <Text style={styles.fieldLabel}>Bodenfarbe (28)</Text>
        <WithToolButton onPress={() => onOpenTool("farbe")}>
          <Controller
            control={control}
            name="farbe_munsell"
            render={({ field: { onChange, value } }) => (
              <ValidatedField
                placeholder="z.B. 10YR 4/3"
                placeholderTextColor={PLACEHOLDER_COLOR}
                onChangeText={onChange}
                value={value}
                validate={validateMunsell}
                fieldLabel="Bodenfarbe (Munsell)"
              />
            )}
          />
        </WithToolButton>

        <DropdownWithTool
          label="Carbonatgehalt (48)"
          name="carbonat"
          options={CARBONAT_OPTIONS}
          onOpenTool={() => onOpenTool("carbonat")}
        />
        <DropdownWithTool
          label="Packungsdichte (42)"
          name="packungsdichte"
          options={PACKUNGSDICHTE_OPTIONS}
          onOpenTool={() => onOpenTool("packungsdichte")}
        />
        <DropdownWithTool
          label="Feinwurzeln (41a)"
          name="feinwurzeln"
          options={FEINWURZELN_OPTIONS}
          onOpenTool={() => onOpenTool("feinwurzeln")}
        />

        <Text style={styles.fieldLabel}>Gefüge (35)</Text>
        <WithToolButton onPress={() => onOpenTool("gefuege")}>
          <Controller
            control={control}
            name="gefuege"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="z.B. ein, sub"
                placeholderTextColor={PLACEHOLDER_COLOR}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </WithToolButton>
      </Section>

      <Section title="Notizen (57)">
        <Controller
          control={control}
          name="notizen"
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, localStyles.multiline]}
              placeholder="Freitext..."
              placeholderTextColor={PLACEHOLDER_COLOR}
              multiline
              numberOfLines={4}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </Section>
    </>
  );
}

/** Row with an input on the left and a fixed-width tool button on the right. */
function WithToolButton({
  label = "Bestimmungshilfe",
  onPress,
  children,
}: {
  label?: string;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <View style={formStyles.fieldWithTool}>
      {children}
      <TouchableOpacity
        style={[styles.actionButton, formStyles.halfRowBtn]}
        onPress={onPress}
      >
        <Text style={styles.actionButtonText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

/** Labeled KA6 code dropdown with a Bestimmungshilfe button. */
function DropdownWithTool({
  label,
  name,
  options,
  onOpenTool,
}: {
  label: string;
  name: "carbonat" | "packungsdichte" | "feinwurzeln";
  options: LabeledOption[];
  onOpenTool: () => void;
}) {
  const { control } = useFormContext<HorizontFormData>();
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <WithToolButton onPress={onOpenTool}>
        <View style={{ flex: 1 }}>
          <Controller
            control={control}
            name={name}
            render={({ field: { onChange, value } }) => (
              <LabeledDropdownField
                value={value}
                options={options}
                placeholder="Auswählen…"
                onChange={onChange}
              />
            )}
          />
        </View>
      </WithToolButton>
    </>
  );
}

const localStyles = StyleSheet.create({
  inputWithUnit: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 4,
  },
  hint: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
});
