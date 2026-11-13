import { useState } from "react";
import { Text, View } from "react-native";
import { useFormContext, useWatch } from "react-hook-form";
import { styles } from "@/styles/styles";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import type { Horizont } from "@/lib/db/horizontQueries";
import {
  calcProfileFKOrNFK,
  calcProfileSWert,
  rateFK,
  rateNFK,
  rateSWert,
} from "@/lib/calc/mappingMaths";
import {
  ControlledReadonlyField,
  HeadingRow,
  RatingField,
  ReadonlyField,
  formStyles,
} from "../shared";
import type { AufnahmeFormData } from "./types";

/**
 * Collapsible block with profile-level values aggregated from the Horizonte
 * (Gründigkeit, FK bis 1 m, nFK and S-Wert im effektiven Wurzelraum). Read-only.
 */
export default function BerechneteWerteSection({
  horizonte,
}: {
  horizonte: Horizont[];
}) {
  const { control } = useFormContext<AufnahmeFormData>();
  const [expanded, setExpanded] = useState(false);
  const effWurzelraum = parseFloat(
    useWatch({ control, name: "effektiver_wurzelraum" }),
  );

  const profileFK = calcProfileFKOrNFK(horizonte, 100, "fk_lm2");
  const profileNFK = calcProfileFKOrNFK(horizonte, effWurzelraum, "nfk_lm2");
  const profileSWert = calcProfileSWert(horizonte, effWurzelraum);

  return (
    <CollapsibleSection
      title="Automatisch berechnete Werte"
      expanded={expanded}
      onToggle={() => setExpanded((v) => !v)}
    >
      <Text style={styles.erweiterteHint}>
        Alle Werte werden automatisch aus den Horizontdaten berechnet. Falls
        nichts angezeigt wird, bitte die entsprechenden Felder in den Horizonten
        prüfen.
      </Text>

      <HeadingRow
        title="Gründigkeit"
        titleStyle={styles.fieldLabel}
        info="Summe aller Horizont-Mächtigkeiten in cm, berechnet aus den Tiefenangaben der Horizonte."
      />
      <ControlledReadonlyField
        control={control}
        name="grundigkeit"
        unit="cm"
        placeholder="Wird automatisch berechnet"
      />

      <View style={formStyles.calcBlock}>
        <HeadingRow
          title="Feldkapazität bis 1 m"
          info="Profilsumme der Feldkapazität über alle Horizonte bis 1 m Tiefe in l/m². Benötigt Bodenart, Packungsdichte (für die Trockenrohdichte) und Mächtigkeit in den Horizonten."
        />
        <ReadonlyField
          value={profileFK != null ? profileFK.toFixed(1) : ""}
          unit="l/m²"
        />
        <RatingField
          value={profileFK != null ? `${rateFK(profileFK)} (KA5)` : ""}
        />
      </View>

      <View style={formStyles.calcBlock}>
        <HeadingRow
          title="Nutzbare Feldkapazität"
          info="Profilsumme der nutzbaren Feldkapazität über alle Horizonte bis zum effektiven Wurzelraum in l/m². Benötigt Bodenart, Packungsdichte (für die Trockenrohdichte), Mächtigkeit und den eingetragenen effektiven Wurzelraum."
        />
        <ReadonlyField
          value={profileNFK != null ? profileNFK.toFixed(1) : ""}
          unit="l/m²"
        />
        <RatingField
          value={profileNFK != null ? `${rateNFK(profileNFK)} (KA5)` : ""}
        />
      </View>

      <View style={formStyles.calcBlock}>
        <HeadingRow
          title="S-Wert (im eff. Wurzelraum)"
          info="Sorptionssumme im effektiven Wurzelraum in mol&#x2c;/m². Berechnet als KAK × (Basensättigung/100) × Trockenrohdichte × Mächtigkeit je Horizont. A-Horizonte gehen vollständig ein, alle anderen zur Hälfte. Benötigt KAK, Basensättigung und Trockenrohdichte (aus Packungsdichte abgeleitet) in den Horizonten."
        />
        <ReadonlyField
          value={profileSWert != null ? profileSWert.toFixed(2) : ""}
          unit="cmol_c/m2"
        />
        <RatingField
          value={profileSWert != null ? rateSWert(profileSWert) : ""}
        />
      </View>
    </CollapsibleSection>
  );
}
