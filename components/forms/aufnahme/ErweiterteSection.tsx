import { useState } from "react";
import { Text } from "react-native";
import { useFormContext } from "react-hook-form";
import { styles } from "@/styles/styles";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import { TextFieldList, type TextFieldSpec } from "../shared";
import type { AufnahmeFormData } from "./types";

const FIELDS: readonly TextFieldSpec<AufnahmeFormData>[] = [
  ["hangneigung", "Hangneigung (12)", "z.B. 5°"],
  ["reliefformtyp", "Reliefformtyp (14)", "z.B. Kuppe"],
  ["mikrorelief", "Mikrorelief (16)", "z.B. eben"],
  ["nat_bodenabtrag", "Natürlicher Bodenabtrag (17a)", ""],
  ["kuenstl_bodenabtrag", "Künstlicher Bodenabtrag (17b)", ""],
  ["anthropogene_veraend", "Anthropogene Veränderungen (21)", ""],
  ["bodenoberflaeche", "Bodenoberfläche (22)", ""],
  ["versiegelungsart", "Versiegelungsart (23)", ""],
  ["regenwuermer", "Regenwürmer (24)", ""],
  ["substratsyst_einheit", "Substratsystematische Einheit (61)", ""],
  ["hydrogeniet_moortyp", "Hydrogeniet. Moortyp (64)", ""],
  ["durchwurzelbarer_bodenraum", "Durchwurzelbarer Bodenraum (65)", ""],
  ["wasserstand_gof", "Wasserstand u. GOF (66)", ""],
  ["grundnaessestufe", "Grundnässestufe (67)", ""],
  ["besond_wasserverh", "Besond. Wasserverhältnisse (68)", ""],
  ["stau_haftnaessestufe", "Stau-/Haftnässestufe (69)", ""],
  ["erosionsgrad", "Erosionsgrad (70)", ""],
];

/** Collapsible "Erweiterte Bodenaufnahme" block with free-text KA6 site fields. */
export default function ErweiterteSection() {
  const { control } = useFormContext<AufnahmeFormData>();
  const [expanded, setExpanded] = useState(false);
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
      <TextFieldList control={control} fields={FIELDS} />
    </CollapsibleSection>
  );
}
