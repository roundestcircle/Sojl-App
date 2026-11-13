import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { styles } from "@/styles/styles";
import LabeledDropdownField from "@/components/ui/LabeledDropdownField";
import ValidatedField from "@/components/ui/ValidatedField";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import TreeTool from "@/components/tools/TreeTool";
import HorizontLexikonContent from "@/components/lexikon/HorizontLexikonContent";
import HumusformLexikonContent from "@/components/lexikon/HumusformLexikonContent";
import { validateEffektiverWurzelraum } from "@/lib/validation/fieldValidation";
import { ToolModal } from "@/components/ui/ToolModal";
import { HUMUSFORMEN } from "@/lib/calc/mappingMaths";
import { WithUnit } from "../shared";
import type { AufnahmeFormData } from "./types";

type ProfilModal = "bodentyp" | "horizontLexikon" | "humusformLexikon";

/**
 * "Profil" block: Bodentyp (+ decision tree), Humusform (+ Lexikon),
 * Ausgangsgestein and Effektiver Wurzelraum. The Bodentyp tool's result
 * ("Typ BB – Braunerde") is split into the Abk. and Bodentyp fields.
 */
export default function ProfilSection() {
  const { control, setValue } = useFormContext<AufnahmeFormData>();
  // The Horizontlexikon can be opened on top of the Bodentyp modal, so each
  // modal has its own flag rather than a single "active" value.
  const [open, setOpen] = useState<Record<ProfilModal, boolean>>({
    bodentyp: false,
    horizontLexikon: false,
    humusformLexikon: false,
  });
  const show = (m: ProfilModal, v: boolean) =>
    setOpen((prev) => ({ ...prev, [m]: v }));

  return (
    <>
      <Text style={[styles.sectionTitle, localStyles.sectionGap]}>Profil</Text>

      <View style={styles.formRow}>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Bodentyp (60)</Text>
          <Controller
            control={control}
            name="bodentyp"
            render={({ field: { onChange, value } }) => (
              <TextField
                placeholder="z.B. Braunerde"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>
        <View style={[styles.halfField, { flex: 0.6 }]}>
          <Text style={styles.fieldLabel}>Abk.</Text>
          <Controller
            control={control}
            name="bodtyp_abk"
            render={({ field: { onChange, value } }) => (
              <TextField
                placeholder="BB"
                autoCapitalize="characters"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>
      </View>
      <Button
        title="Bodentyp bestimmen"
        onPress={() => show("bodentyp", true)}
      />

      <View style={styles.formRow}>
        <View style={styles.halfField}>
          <Text style={styles.fieldLabel}>Humusform (63)</Text>
          <Controller
            control={control}
            name="humusform"
            render={({ field: { onChange, value } }) => (
              <LabeledDropdownField
                value={value}
                options={HUMUSFORMEN}
                placeholder="Auswählen…"
                onChange={onChange}
              />
            )}
          />
        </View>
        <View style={[styles.halfField, { flex: 0.6 }]}>
          <Text style={styles.fieldLabel}>Abk.</Text>
          <Controller
            control={control}
            name="humsfrm_abk"
            render={({ field: { onChange, value } }) => (
              <TextField
                placeholder="mf"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>
      </View>
      <Button
        title="Humusformlexikon"
        onPress={() => show("humusformLexikon", true)}
      />

      <Text style={styles.fieldLabel}>Ausgangsgestein (62)</Text>
      <Controller
        control={control}
        name="ausgangsgestein"
        render={({ field: { onChange, value } }) => (
          <TextField
            placeholder="z.B. Kalkstein"
            onChangeText={onChange}
            value={value}
          />
        )}
      />

      <Text style={[styles.fieldLabel, { marginTop: 8 }]}>
        Effektiver Wurzelraum
      </Text>
      <Controller
        control={control}
        name="effektiver_wurzelraum"
        render={({ field: { onChange, value } }) => (
          <WithUnit unit="cm">
            <ValidatedField
              keyboardType="number-pad"
              placeholder="z.B. 80"
              onChangeText={onChange}
              value={value}
              validate={validateEffektiverWurzelraum}
              fieldLabel="Effektiver Wurzelraum"
            />
          </WithUnit>
        )}
      />

      <ToolModal
        visible={open.bodentyp}
        onClose={() => show("bodentyp", false)}
        headerLeft={
          <Button
            title="Horizontlexikon"
            variant="outline"
            size="sm"
            onPress={() => show("horizontLexikon", true)}
          />
        }
      >
        <TreeTool
          kind="bodentyp"
          onConfirm={(v) => {
            const [typPart, name] = v.split(" – ");
            setValue("bodtyp_abk", typPart.replace(/^Typ\s+/, ""));
            setValue("bodentyp", name ?? v);
            show("bodentyp", false);
          }}
        />
      </ToolModal>

      <ToolModal
        visible={open.horizontLexikon}
        onClose={() => show("horizontLexikon", false)}
      >
        <HorizontLexikonContent />
      </ToolModal>

      <ToolModal
        visible={open.humusformLexikon}
        onClose={() => show("humusformLexikon", false)}
      >
        <HumusformLexikonContent />
      </ToolModal>
    </>
  );
}

const localStyles = StyleSheet.create({
  sectionGap: {
    marginTop: 16,
  },
});
