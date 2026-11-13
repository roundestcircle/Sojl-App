import { useState, useEffect, useRef } from "react";
import { View, Text } from "react-native";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { styles } from "@/styles/styles";
import type { Aufnahme, AufnahmeDetails } from "@/lib/db/aufnahmeQueries";
import type { Horizont } from "@/lib/db/horizontQueries";
import StandortSection from "./StandortSection";
import ProfilSection from "./ProfilSection";
import StandorteigenschaftenSection from "./StandorteigenschaftenSection";
import ErweiterteSection from "./ErweiterteSection";
import BerechneteWerteSection from "./BerechneteWerteSection";
import { degreeStringsToUtm, utmStringsToDegrees } from "@/lib/geo/coordinates";
import { useFormAutosave } from "@/hooks/useFormAutosave";
import TextField from "@/components/ui/TextField";
import { formStyles } from "../shared";
import {
  toAufnahmeFormDefaults,
  toAufnahmeDetails,
  DEGREE_FIELDS,
  UTM_FIELDS,
  type AufnahmeFormData,
  type CoordMode,
  type CoordSource,
} from "./types";

const UTM_FIELD_SET: ReadonlySet<string> = new Set(UTM_FIELDS);
const DEGREE_FIELD_SET: ReadonlySet<string> = new Set(DEGREE_FIELDS);

type Props = {
  initialData: Aufnahme;
  onSave: (data: AufnahmeDetails) => void;
  /** Gründigkeit computed by the screen from all Horizonte (cm). */
  calcGrundigkeit?: string;
  /** All Horizonte of this Aufnahme, for the profile-level FK/nFK/S-Wert sums. */
  horizonte?: Horizont[];
};

/**
 * Site data ("Standortdaten") form for an Aufnahme.
 * Supports UTM and decimal-degree coordinate entry with conversion on toggle.
 * All field changes autosave via onSave (no explicit save button). Stored
 * coordinates are saved unchanged until the user edits a coordinate field
 * (typing or the GPS button), so toggling the input mode never rounds them.
 *
 * Scrolling (incl. keyboard avoidance) is handled by the surrounding screen.
 */
export default function AufnahmeForm({
  initialData,
  onSave,
  calcGrundigkeit,
  horizonte = [],
}: Props) {
  const methods = useForm<AufnahmeFormData>({
    defaultValues: toAufnahmeFormDefaults(initialData),
  });
  const { control, setValue, getValues } = methods;

  const [mode, setMode] = useState<CoordMode>("utm");
  // Source of the coordinates to save (see CoordSource); the flag suppresses
  // source tracking while the toggle writes converted values.
  const coordSourceRef = useRef<CoordSource>("stored");
  const convertingRef = useRef(false);

  // Declared before the Gründigkeit effect so its mount-time write is saved too.
  useFormAutosave(methods, (values, changed) => {
    if (changed && !convertingRef.current) {
      if (UTM_FIELD_SET.has(changed)) coordSourceRef.current = "utm";
      else if (DEGREE_FIELD_SET.has(changed))
        coordSourceRef.current = "degrees";
    }
    onSave(toAufnahmeDetails(values, coordSourceRef.current, initialData));
  });

  useEffect(() => {
    if (calcGrundigkeit !== undefined) setValue("grundigkeit", calcGrundigkeit);
  }, [calcGrundigkeit, setValue]);

  /** Switches coordinate input mode, converting the current values so nothing is lost. */
  const handleToggleMode = () => {
    const newMode: CoordMode = mode === "utm" ? "degrees" : "utm";
    convertingRef.current = true;
    if (newMode === "degrees") {
      const deg = utmStringsToDegrees(
        getValues("easting"),
        getValues("northing"),
        getValues("zone"),
      );
      if (deg) {
        setValue("lat", deg.lat);
        setValue("lon", deg.lon);
      }
    } else {
      const utm = degreeStringsToUtm(getValues("lat"), getValues("lon"));
      if (utm) {
        setValue("easting", utm.easting);
        setValue("northing", utm.northing);
        setValue("zone", utm.zone);
      }
    }
    convertingRef.current = false;
    setMode(newMode);
  };

  return (
    <FormProvider {...methods}>
      <View style={styles.section}>
        <StandortSection mode={mode} onToggleMode={handleToggleMode} />
        <ProfilSection />
        <StandorteigenschaftenSection />

        <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Notizen</Text>
        <Controller
          control={control}
          name="notizen"
          render={({ field: { onChange, value } }) => (
            <TextField
              style={formStyles.multiline}
              placeholder="Freitext…"
              multiline
              numberOfLines={3}
              onChangeText={onChange}
              value={value}
            />
          )}
        />

        <ErweiterteSection />
        <BerechneteWerteSection horizonte={horizonte} />
      </View>
    </FormProvider>
  );
}
