import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useForm, FormProvider } from "react-hook-form";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import type { Horizont } from "@/utils/HorizonQueries";

// ─── Form shape ────────────────────────────────────────────────────────────────

export type HorizontFormData = {
  horizontname: string;
  farbe_munsell: string;
  bodenart: string;
  anteil: string;
  notizen: string;
  tiefe_oben: string;
  tiefe_unten: string;
};

// ─── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  /** Existing DB data to pre-fill the form, if any */
  initialData?: Partial<Horizont>;
  /** Called with form values when user presses Speichern */
  onSave: (data: HorizontFormData) => void;
  /** Horizon number shown in the section header */
  horizontNummer: number;
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function HorizontFormular({ initialData, onSave, horizontNummer }: Props) {
  const methods = useForm<HorizontFormData>({
    defaultValues: {
      horizontname: initialData?.horizontname ?? "",
      farbe_munsell: initialData?.farbe_munsell ?? "",
      bodenart: initialData?.bodenart ?? "",
      anteil: initialData?.anteil ?? "",
      notizen: initialData?.notizen ?? "",
      tiefe_oben: initialData?.tiefe_oben ?? "",
      tiefe_unten: initialData?.tiefe_unten ?? "",
    },
  });

  const { handleSubmit, setValue } = methods;

  return (
    <FormProvider {...methods}>
      <ScrollView
        contentContainerStyle={localStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Horizontname ── */}
        <Section title="Horizontname">
          <TextInput
            style={styles.input}
            placeholder="z.B. Ap, Bv, C"
            placeholderTextColor={colors.primary + "66"}
            onChangeText={(v) => setValue("horizontname", v)}
            defaultValue={initialData?.horizontname ?? ""}
          />
        </Section>

        {/* ── Tiefe ── */}
        <Section title="Tiefe (cm)">
          <View style={styles.formRow}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Von</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="z.B. 0"
                placeholderTextColor={colors.primary + "66"}
                onChangeText={(v) => setValue("tiefe_oben", v)}
                defaultValue={initialData?.tiefe_oben ?? ""}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Bis</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                placeholder="z.B. 30"
                placeholderTextColor={colors.primary + "66"}
                onChangeText={(v) => setValue("tiefe_unten", v)}
                defaultValue={initialData?.tiefe_unten ?? ""}
              />
            </View>
          </View>
        </Section>

        {/* ── Farbe ── */}
        <Section title="Bodenfarbe (Munsell)">
          <TextInput
            style={styles.input}
            placeholder="z.B. 10YR 4/3"
            placeholderTextColor={colors.primary + "66"}
            onChangeText={(v) => setValue("farbe_munsell", v)}
            defaultValue={initialData?.farbe_munsell ?? ""}
          />
        </Section>

        {/* ── Bodenart ── */}
        <Section title="Bodenart / Textur">
          {/* TODO: replace with TexTreeField component */}
          <TextInput
            style={styles.input}
            placeholder="Bodenart (Platzhalter)"
            placeholderTextColor={colors.primary + "66"}
            onChangeText={(v) => setValue("bodenart", v)}
            defaultValue={initialData?.bodenart ?? ""}
          />
        </Section>

        {/* ── Anteil ── */}
        <Section title="Anteil">
          {/* TODO: replace with SoilShareField component */}
          <TextInput
            style={styles.input}
            placeholder="Anteil (Platzhalter)"
            placeholderTextColor={colors.primary + "66"}
            onChangeText={(v) => setValue("anteil", v)}
            defaultValue={initialData?.anteil ?? ""}
          />
        </Section>

        {/* ── Notizen ── */}
        <Section title="Notizen">
          <TextInput
            style={[styles.input, localStyles.multiline]}
            placeholder="Freitext..."
            placeholderTextColor={colors.primary + "66"}
            multiline
            numberOfLines={4}
            onChangeText={(v) => setValue("notizen", v)}
            defaultValue={initialData?.notizen ?? ""}
          />
        </Section>

        {/* ── Save button ── */}
        <TouchableOpacity
          style={[styles.button, localStyles.saveButton]}
          onPress={handleSubmit(onSave)}
        >
          <Text style={[styles.maintext, { color: "#fff" }]}>Speichern</Text>
        </TouchableOpacity>

      </ScrollView>
    </FormProvider>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const localStyles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    gap: 8,
    paddingBottom: 40,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: colors.primary,
    marginTop: 16,
    alignSelf: "stretch",
  },
});