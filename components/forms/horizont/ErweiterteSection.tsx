import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { styles } from "@/styles/styles";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import {
  TextFieldList,
  formStyles,
  PLACEHOLDER_COLOR,
  type TextFieldSpec,
} from "../shared";
import type { HorizontFormData } from "./types";

type Spec = TextFieldSpec<HorizontFormData>;

const MERKMALE_FIELDS: readonly Spec[] = [
  ["bodenfeuchte", "Bodenfeuchte (32)"],
  ["konsistenz", "Konsistenz (33)"],
  ["oxidationsmerkmale", "Oxidationsmerkmale (30)"],
  ["reduktionsmerkmale", "Reduktionsmerkmale (31)"],
  ["pedogene_merkmale", "Weitere pedogene Merkmale (34)"],
  ["lagerungsart_erw", "Lagerungsart (36)"],
  ["lagerungsform", "Lagerungsform (37)"],
  ["verfestigungsdichte", "Verfestigungsdichte (38)"],
  ["hohlraeume", "Hohlräume / Sekundärporen (39)"],
  ["zersetzungsstufe", "Zersetzungsstufe / Humifizierungsgrad (40)"],
  ["wurzelverteilung", "Wurzelverteilung (41b)"],
  ["pilzmycel", "Pilzmycel (41c)"],
  ["grobbodenanbindung", "Grobbodenanbindung (47)"],
  ["geog_org_kohlenstoff", "Geogener Organischer Kohlenstoff (49)"],
];

const SUBSTRAT_FIELDS: readonly Spec[] = [
  ["geogenese", "Geogenese (43)"],
  ["periglaziaere_lagen", "Periglaziäre Lagen (51)"],
  ["stratigraphie", "Stratigraphie (55)"],
  ["grobkomponenten", "Grobkomponenten (52a)"],
  ["feinkomponenten", "Feinkomponenten (52b)"],
  ["beimengungen", "Beimengungen (53)"],
  ["bes_strukturen", "Besondere Strukturen (54)"],
];

const SONSTIGE_FIELDS: readonly Spec[] = [
  ["geruch", "Geruch (56)"],
  ["substratart", "Substratart"],
];

/**
 * Collapsible "Erweiterte Bodenaufnahme" block: free-text KA6 fields without
 * determination tools, Substratkennzeichnung, and a dynamic Probennummern list.
 */
export default function ErweiterteSection() {
  const { control } = useFormContext<HorizontFormData>();
  const [expanded, setExpanded] = useState(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "probennummern",
  });

  return (
    <CollapsibleSection
      title="Erweiterte Bodenaufnahme"
      expanded={expanded}
      onToggle={() => setExpanded((v) => !v)}
    >
      <Text style={styles.erweiterteHint}>
        Hierfür stehen noch keine Bestimmungshilfen zur Verfügung. Bitte nutzt
        die KA6 für die korrekte Formatierung der Werte.
      </Text>

      <TextFieldList control={control} fields={MERKMALE_FIELDS} />

      <Text style={[styles.fieldLabel, { marginTop: 8, fontWeight: "700" }]}>
        Substratkennzeichnung
      </Text>
      <TextFieldList control={control} fields={SUBSTRAT_FIELDS} />

      <TextFieldList control={control} fields={SONSTIGE_FIELDS} />

      <Text style={styles.fieldLabel}>Probennummern (59)</Text>
      {fields.map((field, index) => (
        <View key={field.id} style={formStyles.fieldWithTool}>
          <Controller
            control={control}
            name={`probennummern.${index}.value`}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={`Probe ${index + 1}`}
                placeholderTextColor={PLACEHOLDER_COLOR}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                paddingHorizontal: 14,
                paddingVertical: 12,
                backgroundColor: "#c00",
              },
            ]}
            onPress={() => remove(index)}
          >
            <Text style={styles.actionButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => append({ value: "" })}
      >
        <Text style={styles.actionButtonText}>+ Weitere Probe hinzufügen</Text>
      </TouchableOpacity>
    </CollapsibleSection>
  );
}
