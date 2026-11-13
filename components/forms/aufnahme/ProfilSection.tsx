import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { styles } from "@/styles/styles";
import { colors } from "@/styles/colors";
import LabeledDropdownField from "@/components/ui/LabeledDropdownField";
import ValidatedField from "@/components/ui/ValidatedField";
import TreeTool from "@/components/tools/TreeTool";
import HorizontLexikonContent from "@/components/lexikon/HorizontLexikonContent";
import HumusformLexikonContent from "@/components/lexikon/HumusformLexikonContent";
import { validateEffektiverWurzelraum } from "@/lib/validation/fieldValidation";
import { ToolModal } from "@/components/ui/ToolModal";
import { HUMUSFORMEN } from "@/lib/calc/mappingMaths";
import { formStyles, PLACEHOLDER_COLOR } from "../shared";
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
              <TextInput
                style={styles.input}
                placeholder="z.B. Braunerde"
                placeholderTextColor={PLACEHOLDER_COLOR}
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
              <TextInput
                style={styles.input}
                placeholder="BB"
                autoCapitalize="characters"
                placeholderTextColor={PLACEHOLDER_COLOR}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => show("bodentyp", true)}
      >
        <Text style={styles.actionButtonText}>Bodentyp bestimmen</Text>
      </TouchableOpacity>

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
              <TextInput
                style={styles.input}
                placeholder="mf"
                placeholderTextColor={PLACEHOLDER_COLOR}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => show("humusformLexikon", true)}
      >
        <Text style={styles.actionButtonText}>Humusformlexikon</Text>
      </TouchableOpacity>

      <Text style={styles.fieldLabel}>Ausgangsgestein (62)</Text>
      <Controller
        control={control}
        name="ausgangsgestein"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            placeholder="z.B. Kalkstein"
            placeholderTextColor={PLACEHOLDER_COLOR}
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
          <View style={formStyles.inputWithUnit}>
            <ValidatedField
              keyboardType="number-pad"
              placeholder="z.B. 80"
              placeholderTextColor={PLACEHOLDER_COLOR}
              onChangeText={onChange}
              value={value}
              validate={validateEffektiverWurzelraum}
              fieldLabel="Effektiver Wurzelraum"
              style={{ flex: 1 }}
            />
            <Text style={formStyles.unit}>cm</Text>
          </View>
        )}
      />

      <ToolModal
        visible={open.bodentyp}
        onClose={() => show("bodentyp", false)}
        headerLeft={
          <TouchableOpacity
            style={localStyles.lexikonBtn}
            onPress={() => show("horizontLexikon", true)}
          >
            <Text style={localStyles.lexikonBtnText}>Horizontlexikon</Text>
          </TouchableOpacity>
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
  lexikonBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  lexikonBtnText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
});
