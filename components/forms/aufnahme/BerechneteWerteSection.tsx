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
  type ProfileSum,
  type Rating,
} from "@/lib/calc/mappingMaths";
import { parseDecimal } from "@/lib/number";
import {
  ControlledReadonlyField,
  HeadingRow,
  RatingField,
  ReadonlyField,
  formStyles,
} from "../shared";
import type { AufnahmeFormData } from "./types";

/** Display value and rating text of a profile sum. */
function formatSum(
  sum: ProfileSum,
  digits: number,
  rateFn: (v: number) => Rating,
  suffix = "",
): { value: string; rating: string } {
  if (sum === null) return { value: "", rating: "" };
  if (sum === "unvollständig") {
    return {
      value: "unvollständig",
      rating: "Lücken, Überlappungen oder fehlende Werte in den Horizonten",
    };
  }
  return { value: sum.toFixed(digits), rating: `${rateFn(sum)}${suffix}` };
}

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
  const effWurzelraum =
    parseDecimal(useWatch({ control, name: "effektiver_wurzelraum" })) ?? NaN;

  const fk = formatSum(
    calcProfileFKOrNFK(horizonte, 100, "fk_lm2"),
    1,
    rateFK,
    " (KA5)",
  );
  const nfk = formatSum(
    calcProfileFKOrNFK(horizonte, effWurzelraum, "nfk_lm2"),
    1,
    rateNFK,
    " (KA5)",
  );
  const sWert = formatSum(
    calcProfileSWert(horizonte, effWurzelraum),
    0,
    rateSWert,
  );

  return (
    <CollapsibleSection
      title="Automatisch berechnete Werte"
      expanded={expanded}
      onToggle={() => setExpanded((v) => !v)}
    >
      <Text style={styles.hint}>
        Alle Werte werden automatisch aus den Horizontdaten berechnet. Die
        Horizonte müssen den Tiefenbereich lückenlos ab 0 cm abdecken. Falls
        nichts oder „unvollständig“ angezeigt wird, bitte die Tiefen und Felder
        in den Horizonten prüfen.
      </Text>

      <HeadingRow
        title="Gründigkeit"
        titleStyle={styles.fieldLabel}
        info="Tiefe der Untergrenze des tiefsten Horizonts in cm, aus den Tiefenangaben der Horizonte."
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
        <ReadonlyField value={fk.value} unit="l/m²" />
        <RatingField value={fk.rating} />
      </View>

      <View style={formStyles.calcBlock}>
        <HeadingRow
          title="Nutzbare Feldkapazität"
          info="Profilsumme der nutzbaren Feldkapazität über alle Horizonte bis zum effektiven Wurzelraum in l/m². Benötigt Bodenart, Packungsdichte (für die Trockenrohdichte), Mächtigkeit und den eingetragenen effektiven Wurzelraum."
        />
        <ReadonlyField value={nfk.value} unit="l/m²" />
        <RatingField value={nfk.rating} />
      </View>

      <View style={formStyles.calcBlock}>
        <HeadingRow
          title="S-Wert (im eff. Wurzelraum)"
          info="Sorptionssumme im effektiven Wurzelraum in cmol_c/m². Berechnet als KAK × (Basensättigung/100) × Trockenrohdichte × Mächtigkeit je Horizont. A-Horizonte gehen vollständig ein, alle anderen zur Hälfte. Benötigt KAK, Basensättigung und Trockenrohdichte (aus Packungsdichte abgeleitet) in den Horizonten."
        />
        <ReadonlyField value={sWert.value} unit="cmol_c/m²" />
        <RatingField value={sWert.rating} />
      </View>
    </CollapsibleSection>
  );
}
