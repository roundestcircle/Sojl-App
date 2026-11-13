import { useState } from "react";
import { View, Text } from "react-native";
import { useFormContext, useWatch } from "react-hook-form";
import { styles } from "@/styles/styles";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import {
  rateGPV,
  rateLK,
  rateFK_pct,
  rateNFK_pct,
  rateKAK,
} from "@/lib/calc/mappingMaths";
import {
  ControlledReadonlyField,
  HeadingRow,
  RatingField,
  formStyles,
} from "../shared";
import type { HorizontFormData } from "./types";

const MISSING_HINT =
  "Falls euch nichts angezeigt wird, guckt nochmal nach ob ihr alles benötigte ausgefüllt habt.";
const PORE_INPUTS =
  "Bodenart, Trockenrohdichte (aus Packungsdichte abgeleitet), Humusgehalt, Skelettanteil und Mächtigkeit";

/** Rates a numeric string with `rate`, or returns "" when empty. */
const rated = (v: string, rate: (n: number) => string) =>
  v ? rate(parseFloat(v)) : "";

/**
 * Collapsible block with all values derived by useHorizontCalculations
 * (Mächtigkeit, Humus, TRD, Porenkennwerte, KAK, Basensättigung). Read-only.
 */
export default function BerechneteWerteSection() {
  const { control } = useFormContext<HorizontFormData>();
  const [expanded, setExpanded] = useState(false);
  const [gpv, lk, fk, nfk, kak] = useWatch({
    control,
    name: ["gpv_pct", "lk_pct", "fk_pct", "nfk_pct", "kak"],
  });

  return (
    <CollapsibleSection
      title="Automatisch berechnete Werte"
      expanded={expanded}
      onToggle={() => setExpanded((v) => !v)}
    >
      <HeadingRow
        title="Mächtigkeit (dm)"
        info={`Dicke des Horizonts in Dezimetern, automatisch berechnet aus Tiefe oben und Tiefe unten. ${MISSING_HINT}`}
      />
      <ControlledReadonlyField
        control={control}
        name="maechtigk_dm"
        placeholder="Wird automatisch berechnet"
      />

      <View style={{ gap: 6 }}>
        <HeadingRow
          title="Humusgehalt (29)"
          info={`Geschätzter Humusgehalt nach Renger (1987) in %; benötigt Bodenfarbe (Munsell), pH (CaCl₂) und Tonanteil. ${MISSING_HINT}`}
        />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Humusgehalt</Text>
            <ControlledReadonlyField
              control={control}
              name="humus_pct"
              unit="%"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Humusklasse</Text>
            <ControlledReadonlyField control={control} name="humus" />
          </View>
        </View>
      </View>

      <View style={formStyles.calcBlock}>
        <HeadingRow
          title="Trockenrohdichte (TRD)"
          info="Mittlere Trockenrohdichte (TRD) nach KA6 Tabelle B2 (Renger et al. 2009) in g/cm³ bzw. kg/dm³, abgeleitet aus Bodenart und Packungsdichteklasse (Pd). Die Tabelle gilt für Mineralböden mit Humusgehalt <1%. Falls euch nichts angezeigt wird, guckt nochmal nach ob ihr Bodenart und Packungsdichte ausgefüllt habt und die Bodenart in der Tabelle vorkommt."
        />
        <ControlledReadonlyField
          control={control}
          name="trockenrohdichte"
          unit="g/cm³"
        />
      </View>

      <PoreReadout
        title="Gesamte Porenkapazität (GPV)"
        pctField="gpv_pct"
        lm2Field="gpv_lm2"
        rating={rated(gpv, rateGPV)}
        info={`Gesamtvolumen aller Bodenporen in Vol% und l/m²; benötigt ${PORE_INPUTS} (Tiefe oben + Tiefe unten). ${MISSING_HINT}`}
      />
      <PoreReadout
        title="Luftkapazität (LK)"
        pctField="lk_pct"
        lm2Field="lk_lm2"
        rating={rated(lk, rateLK)}
        info={`Anteil grober Poren (Luftporen) in Vol% und l/m²; benötigt ${PORE_INPUTS} (Tiefe oben + Tiefe unten). ${MISSING_HINT}`}
      />
      <PoreReadout
        title="Feldkapazität (FK)"
        pctField="fk_pct"
        lm2Field="fk_lm2"
        rating={rated(fk, rateFK_pct)}
        info={`Wassergehalt nach Ablauf des Schwerkraftwassers in l/m²; benötigt ${PORE_INPUTS}. ${MISSING_HINT}`}
      />
      <PoreReadout
        title="Nutzbare Feldkapazität (nFK)"
        pctField="nfk_pct"
        lm2Field="nfk_lm2"
        rating={rated(nfk, rateNFK_pct)}
        info={`Pflanzenverfügbares Wasser zwischen Feldkapazität und permanentem Welkepunkt in l/m²; benötigt ${PORE_INPUTS}. ${MISSING_HINT}`}
      />

      <View style={formStyles.calcBlock}>
        <HeadingRow
          title="KAK"
          info={`Kationenaustauschkapazität nach Bodenart-Nachschlagetabelle mit Humuskorrektur; benötigt Bodenart, Humusform (Aufnahme) und Humusgehalt. ${MISSING_HINT}`}
        />
        <ControlledReadonlyField
          control={control}
          name="kak"
          unit="cmol_c/kg"
        />
        <RatingField value={rated(kak, rateKAK)} />
      </View>

      <View style={formStyles.calcBlock}>
        <HeadingRow
          title="Basensättigung"
          info={`Anteil der Basen (Ca, Mg, K, Na) an der Kationenaustauschkapazität in %; benötigt pH (CaCl₂) und Humusgehalt. ${MISSING_HINT}`}
        />
        <ControlledReadonlyField
          control={control}
          name="basensaettigung"
          unit="%"
        />
      </View>
    </CollapsibleSection>
  );
}

/** Vol% + l/m² readout pair for one pore parameter, with its verbal rating. */
function PoreReadout({
  title,
  pctField,
  lm2Field,
  rating,
  info,
}: {
  title: string;
  pctField: "gpv_pct" | "lk_pct" | "fk_pct" | "nfk_pct";
  lm2Field: "gpv_lm2" | "lk_lm2" | "fk_lm2" | "nfk_lm2";
  rating: string;
  info: string;
}) {
  const { control } = useFormContext<HorizontFormData>();
  return (
    <View style={formStyles.calcBlock}>
      <HeadingRow title={title} info={info} />
      <View style={styles.formRow}>
        <View style={styles.halfField}>
          <ControlledReadonlyField
            control={control}
            name={pctField}
            unit="Vol%"
          />
        </View>
        <View style={styles.halfField}>
          <ControlledReadonlyField
            control={control}
            name={lm2Field}
            unit="l/m²"
          />
        </View>
      </View>
      <RatingField value={rating} />
    </View>
  );
}
